import './config.js';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { db, isSupabaseConfigured } from './db.js';
import { authenticateToken, optionalAuth, signToken } from './middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  workflowCreateSchema,
  simulationRunSchema,
  simulationSuiteSchema,
  retestSchema,
  copilotChatSchema,
  validate
} from './middleware/validate.js';
import {
  DEFAULT_WORKFLOW,
  FAILURE_MODES,
  CONTINGENCIES,
  generateFailureCombinations,
  simulateScenario,
  runComprehensiveSimulationSuite,
  compareSimulations,
  calculateProbabilityMetrics
} from './services/simulationEngine.js';
import { generateCopilotAnswer, isGeminiConfigured } from './services/copilotService.js';

// Enforce required JWT_SECRET in production mode
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  const isPlaceholder = secret && (secret.includes('your_jwt_secret') || secret.includes('placeholder'));
  if (!secret || secret.trim() === '' || isPlaceholder) {
    console.error('[Security Fatal] JWT_SECRET environment variable is required in production mode and cannot be a default placeholder.');
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Production frontend origins
const knownProductionOrigins = [
  'https://planb-lab1.vercel.app',
  'https://planb-lab.vercel.app'
];

// Parse configured frontend origins from FRONTEND_URL (supports comma-separated list of URLs)
const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/+$/, '')).filter(Boolean)
  : [];

// Local development origins
const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const allowedOrigins = [
  ...new Set([
    ...knownProductionOrigins,
    ...configuredOrigins,
    ...devOrigins
  ])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Requests with no origin (e.g. mobile apps, curl, server-to-server health checks) are allowed
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      /^https:\/\/planb-lab.*\.vercel\.app$/.test(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    // Disallowed origins are rejected cleanly without throwing server errors
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// ==========================================
// 1. SYSTEM HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PLANB LAB Decision Intelligence API',
    version: '1.0.0',
    database: isSupabaseConfigured ? 'supabase-postgresql' : 'local-in-memory-demo',
    geminiAi: isGeminiConfigured ? 'configured' : 'rule-based-fallback-ready'
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.validatedBody;
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await db.createUser({ email, passwordHash, name });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not complete registration.' });
  }
});

app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid Credentials', message: 'Email or password does not match.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Credentials', message: 'Email or password does not match.' });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    res.json({
      message: 'Signed in successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not complete login.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// 3. WORKFLOW CONFIGURATION ENDPOINTS
// ==========================================
app.get('/api/workflows', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const workflows = await db.listWorkflows(userId);
    res.json({ workflows });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve workflows' });
  }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const workflow = await db.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.json({ workflow: DEFAULT_WORKFLOW });
    }
    res.json({ workflow });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

app.post('/api/workflows', authenticateToken, validate(workflowCreateSchema), async (req, res) => {
  try {
    const newWorkflow = await db.createWorkflow({
      ...req.validatedBody,
      userId: req.user.userId
    });
    res.status(201).json({ workflow: newWorkflow });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

app.put('/api/workflows/:id', optionalAuth, async (req, res) => {
  try {
    const updated = await db.updateWorkflow(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Workflow not found to update' });
    }
    res.json({ workflow: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

app.delete('/api/workflows/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await db.getWorkflowById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    if (existing.isTemplate || existing.is_template) {
      return res.status(403).json({ error: 'Forbidden', message: 'System benchmark templates cannot be deleted.' });
    }
    const ownerId = existing.userId || existing.user_id;
    if (ownerId && ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied', message: 'You can only delete your own workflows.' });
    }
    const deleted = await db.deleteWorkflow(req.params.id, req.user.userId);
    if (!deleted) {
      return res.status(400).json({ error: 'Could not delete workflow' });
    }
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// ==========================================
// 4. SIMULATION & STRESS TEST SUITE
// ==========================================
app.get('/api/simulations/meta', (req, res) => {
  res.json({
    failureModes: FAILURE_MODES,
    contingencies: CONTINGENCIES,
    defaultCombinationsCount: 15,
    tagline: 'Break the plan before reality does'
  });
});

app.post('/api/simulations/run', validate(simulationRunSchema), async (req, res) => {
  try {
    const { activeFailures, enabledContingencies, workflowId } = req.validatedBody;
    let workflow = DEFAULT_WORKFLOW;
    if (workflowId && workflowId !== 'college_event_reg') {
      const fetched = await db.getWorkflowById(workflowId);
      if (fetched) workflow = fetched;
    }

    const result = simulateScenario({
      activeFailures,
      enabledContingencies,
      workflow
    });

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Simulation execution failed' });
  }
});

app.post('/api/simulations/suite', validate(simulationSuiteSchema), async (req, res) => {
  try {
    const { enabledContingencies, limit, workflowId } = req.validatedBody;
    let workflow = DEFAULT_WORKFLOW;
    if (workflowId && workflowId !== 'college_event_reg') {
      const fetched = await db.getWorkflowById(workflowId);
      if (fetched) workflow = fetched;
    }

    const suite = runComprehensiveSimulationSuite({
      enabledContingencies,
      workflow,
      limit
    });

    res.json({ suite });
  } catch (err) {
    res.status(500).json({ error: 'Simulation suite failed' });
  }
});

/**
 * 5. APPLY FIX & RETEST (The Core Differentiator)
 * Compares baseline against revised configuration
 */
app.post('/api/simulations/retest', optionalAuth, validate(retestSchema), async (req, res) => {
  try {
    const { baselineContingencies, retestContingencies, workflowId } = req.validatedBody;
    let workflow = DEFAULT_WORKFLOW;
    if (workflowId && workflowId !== 'college_event_reg') {
      const fetched = await db.getWorkflowById(workflowId);
      if (fetched) workflow = fetched;
    }

    // 1. Run Baseline Suite
    const baselineResult = runComprehensiveSimulationSuite({
      enabledContingencies: baselineContingencies,
      workflow
    });

    // 2. Run Retest Suite
    const retestResult = runComprehensiveSimulationSuite({
      enabledContingencies: retestContingencies,
      workflow
    });

    // 3. Compare Both Deterministically
    const comparison = compareSimulations(baselineResult, retestResult);

    // 4. Save to history
    await db.recordSimulationRun({
      workflowId: workflow.id,
      userId: req.user?.userId || null,
      mode: 'retest',
      testedConditions: FAILURE_MODES.map(f => f.id),
      activeContingencies: retestContingencies,
      totalScenariosTested: retestResult.totalScenariosTested,
      successfulScenarios: retestResult.successfulScenarios,
      degradedScenarios: retestResult.degradedScenarios,
      blockedScenarios: retestResult.unresolvedFailureScenarios,
      handledPercentage: retestResult.handledPercentage,
      planHealth: retestResult.planHealth,
      scenarioDetails: comparison
    });

    res.json({
      baseline: baselineResult,
      retest: retestResult,
      comparison
    });
  } catch (err) {
    console.error('Retest error:', err);
    res.status(500).json({ error: 'Retest execution failed' });
  }
});

// Probability calculations
app.get('/api/simulations/probabilities', (req, res) => {
  try {
    const metrics = calculateProbabilityMetrics(DEFAULT_WORKFLOW.components);
    res.json({ metrics });
  } catch (err) {
    res.status(500).json({ error: 'Probability calculations failed' });
  }
});

// ==========================================
// 6. AI COPILOT & CHAT HISTORY
// ==========================================
app.post('/api/copilot/chat', optionalAuth, validate(copilotChatSchema), async (req, res) => {
  try {
    const { message, workflowState, simulationContext, conversationId, workflowId } = req.validatedBody;
    const userId = req.user?.userId || null;

    let activeConversation = null;
    if (conversationId) {
      activeConversation = await db.getConversation(conversationId);
      if (activeConversation) {
        const convOwner = activeConversation.userId || activeConversation.user_id;
        if (convOwner && convOwner !== userId) {
          return res.status(403).json({
            error: 'Access Denied',
            message: 'You cannot access or post to another user\'s conversation.'
          });
        }
      }
    }

    if (!activeConversation) {
      activeConversation = await db.createConversation({
        userId,
        workflowId: workflowId || 'college_event_reg',
        title: message.slice(0, 35) + (message.length > 35 ? '...' : '')
      });
    }

    // Save user message
    await db.addChatMessage({
      conversationId: activeConversation.id,
      sender: 'user',
      message
    });

    // Generate response using Gemini or local decision engine
    const copilotResult = await generateCopilotAnswer({
      message,
      workflowState,
      simulationContext,
      conversationHistory: activeConversation.messages || []
    });

    // Save assistant reply
    await db.addChatMessage({
      conversationId: activeConversation.id,
      sender: 'assistant',
      message: copilotResult.reply,
      contextData: { mode: copilotResult.mode }
    });

    res.json({
      conversationId: activeConversation.id,
      reply: copilotResult.reply,
      mode: copilotResult.mode,
      notice: copilotResult.notice
    });
  } catch (err) {
    console.error('Copilot chat error:', err);
    res.status(500).json({ error: 'Copilot failed to generate a response' });
  }
});

app.get('/api/copilot/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const rawConversations = await db.listConversations(userId);
    const conversations = (rawConversations || []).map(c => {
      const msgs = c.messages || c.chat_messages || [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].message : '';
      return {
        id: c.id,
        title: c.title,
        workflowId: c.workflowId || c.workflow_id || 'college_event_reg',
        workflowName: 'College Fest Registration',
        messageCount: msgs.length,
        snippet: lastMsg.slice(0, 140) || 'Active decision investigation',
        createdAt: c.createdAt || c.created_at,
        updatedAt: c.updatedAt || c.updated_at
      };
    });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch conversations' });
  }
});

app.get('/api/copilot/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await db.getConversation(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    const convOwner = conversation.userId || conversation.user_id;
    if (convOwner && convOwner !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied', message: 'You can only view your own conversations.' });
    }
    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

app.delete('/api/copilot/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await db.getConversation(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    const convOwner = conversation.userId || conversation.user_id;
    if (convOwner && convOwner !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied', message: 'You can only delete your own conversations.' });
    }
    await db.deleteConversation(req.params.id, req.user.userId);
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PLANB LAB API server running on port ${PORT}`);
  console.log(`Tagline: Break the plan before reality does.`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
