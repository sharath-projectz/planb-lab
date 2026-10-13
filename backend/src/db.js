import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { DEFAULT_WORKFLOW, runComprehensiveSimulationSuite } from './services/simulationEngine.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  SUPABASE_URL !== 'https://your-project.supabase.co' && 
  !SUPABASE_KEY.includes('your_supabase')
);

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[Database] Connected to remote Supabase PostgreSQL instance.');
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Database] Controlled Local Demonstration Mode active (in-memory data store with default seed workflows).');
}

// In-Memory Fallback Store (Used when Supabase is not configured)
const memoryStore = {
  users: [
    {
      id: 'demo-user-001',
      email: 'demo@planblab.io',
      // hashed bcrypt for 'demo12345'
      passwordHash: '$2a$10$wK1L8R9b6Rj9zX1J.4N8uOq7sZg1wF9x9y4yK0yE3Q2rF5tG6h8me',
      name: 'Dr. Evelyn Carter (Decision Lead)',
      createdAt: new Date().toISOString()
    }
  ],
  workflows: [
    {
      id: 'college_event_reg',
      userId: 'demo-user-001',
      name: DEFAULT_WORKFLOW.name,
      category: DEFAULT_WORKFLOW.category,
      description: DEFAULT_WORKFLOW.description,
      components: DEFAULT_WORKFLOW.components,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'small_business_pos',
      userId: 'demo-user-001',
      name: 'Omnichannel Boutique Store Checkout & Inventory Sync',
      category: 'Retail & Commerce',
      description: 'Point of sale terminal processing contactless payments, online cloud inventory sync, and receipt printing.',
      components: [
        {
          id: 'pos_terminal',
          stepNumber: 1,
          name: 'POS Terminal Barcode Scan',
          description: 'Cashier scans physical items into cart.',
          failureProb: 0.05,
          dependencies: [],
          canFallback: false,
          allowedFallbacks: []
        },
        {
          id: 'payment_gateway',
          stepNumber: 2,
          name: 'Stripe/Square Cloud Payment Gateway',
          description: 'NFC credit card tap processed via cloud gateway.',
          failureProb: 0.18,
          dependencies: ['internet_outage'],
          canFallback: true,
          allowedFallbacks: ['offline_records']
        },
        {
          id: 'inventory_sync',
          stepNumber: 3,
          name: 'Real-Time ERP Stock Allocation',
          description: 'Updates central warehouse inventory counts.',
          failureProb: 0.12,
          dependencies: ['internet_outage'],
          canFallback: true,
          allowedFallbacks: ['offline_records']
        }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'emergency_evacuation',
      userId: 'demo-user-001',
      name: 'Municipal Campus Emergency Alert & Evacuation Dispatch',
      category: 'Safety & Resilience',
      description: 'Triggering siren alert, SMS geocast warning, assembly point head-count verification.',
      components: [
        {
          id: 'sensor_trigger',
          stepNumber: 1,
          name: 'Smoke / Gas Threshold Sensor Trip',
          description: 'Automated telemetry detects hazardous threshold spike.',
          failureProb: 0.04,
          dependencies: [],
          canFallback: false,
          allowedFallbacks: []
        },
        {
          id: 'telecom_sms',
          stepNumber: 2,
          name: 'Cell Broadcast Emergency Warning',
          description: 'Dispatches mass alert to all registered on-campus mobile devices.',
          failureProb: 0.22,
          dependencies: ['internet_outage', 'otp_unavailable'],
          canFallback: true,
          allowedFallbacks: ['alternative_id_check']
        },
        {
          id: 'warden_muster',
          stepNumber: 3,
          name: 'Floor Warden Safety Roll-Call Verification',
          description: 'Physical accountability at safe evacuation zones.',
          failureProb: 0.15,
          dependencies: ['staff_unavailable'],
          canFallback: true,
          allowedFallbacks: ['backup_staff_oncall']
        }
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  simulationRuns: [
    {
      id: 'sim_run_init',
      workflowId: 'college_event_reg',
      userId: 'demo-user-001',
      mode: 'baseline',
      testedConditions: ['internet_outage', 'otp_unavailable', 'qr_scanner_down', 'staff_unavailable'],
      activeContingencies: [],
      totalScenariosTested: 15,
      successfulScenarios: 0,
      degradedScenarios: 0,
      blockedScenarios: 15,
      handledPercentage: 0,
      planHealth: 'High Risk',
      createdAt: new Date().toISOString()
    }
  ],
  conversations: []
};

// Database Service Interface
export const db = {
  isSupabase: isSupabaseConfigured,

  // Users
  async findUserByEmail(email) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser({ email, passwordHash, name }) {
    const id = crypto.randomUUID();
    const newUser = { id, email, passwordHash, name, createdAt: new Date().toISOString() };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').insert({
        id,
        email,
        password_hash: passwordHash,
        name
      }).select().single();
      if (error) throw error;
      return data;
    }
    memoryStore.users.push(newUser);
    return newUser;
  },

  async findUserById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    return memoryStore.users.find(u => u.id === id) || null;
  },

  // Workflows
  async listWorkflows(userId) {
    if (isSupabaseConfigured) {
      const query = supabase.from('workflows').select('*');
      if (userId) query.or(`user_id.eq.${userId},is_template.eq.true`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return memoryStore.workflows;
  },

  async getWorkflowById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workflows').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    return memoryStore.workflows.find(w => w.id === id) || null;
  },

  async createWorkflow(workflowData) {
    const newWf = {
      id: crypto.randomUUID(),
      ...workflowData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workflows').insert(newWf).select().single();
      if (error) throw error;
      return data;
    }
    memoryStore.workflows.push(newWf);
    return newWf;
  },

  async updateWorkflow(id, updateData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workflows').update({
        ...updateData,
        updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = memoryStore.workflows.findIndex(w => w.id === id);
    if (idx !== -1) {
      memoryStore.workflows[idx] = {
        ...memoryStore.workflows[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      return memoryStore.workflows[idx];
    }
    return null;
  },

  // Simulations
  async recordSimulationRun(runData) {
    const run = {
      id: crypto.randomUUID(),
      ...runData,
      createdAt: new Date().toISOString()
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('simulation_runs').insert(run).select().single();
      if (error) console.warn('[Supabase] Failed to log simulation run:', error.message);
      return data || run;
    }
    memoryStore.simulationRuns.unshift(run);
    return run;
  },

  async getRecentSimulations(workflowId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('simulation_runs').select('*').eq('workflow_id', workflowId).order('created_at', { ascending: false }).limit(10);
      if (error) return [];
      return data;
    }
    return memoryStore.simulationRuns.filter(s => !workflowId || s.workflowId === workflowId).slice(0, 10);
  },

  // Chat Conversations
  async listConversations(userId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_conversations').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return memoryStore.conversations.filter(c => !userId || c.userId === userId);
  },

  async getConversation(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_conversations').select('*, chat_messages(*)').eq('id', id).single();
      if (error) return null;
      if (data && data.chat_messages && !data.messages) {
        data.messages = data.chat_messages.map(m => ({
          id: m.id,
          conversationId: m.conversation_id,
          sender: m.sender,
          message: m.message,
          contextData: m.context_data,
          createdAt: m.created_at
        }));
      }
      return data;
    }
    return memoryStore.conversations.find(c => c.id === id) || null;
  },

  async createConversation({ userId, workflowId, title }) {
    const conv = {
      id: crypto.randomUUID(),
      userId,
      workflowId,
      title: title || 'New Resiliency Investigation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_conversations').insert({
        id: conv.id,
        user_id: userId,
        workflow_id: workflowId,
        title: conv.title
      }).select().single();
      if (error) throw error;
      return data;
    }
    memoryStore.conversations.unshift(conv);
    return conv;
  },

  async addChatMessage({ conversationId, sender, message, contextData }) {
    const msg = {
      id: crypto.randomUUID(),
      conversationId,
      sender,
      message,
      contextData,
      createdAt: new Date().toISOString()
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_messages').insert({
        id: msg.id,
        conversation_id: conversationId,
        sender,
        message,
        context_data: contextData
      }).select().single();
      if (error) throw error;
      return data;
    }
    const conv = memoryStore.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.messages.push(msg);
      conv.updatedAt = new Date().toISOString();
    }
    return msg;
  },

  async deleteConversation(id, userId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('chat_conversations').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return true;
    }
    const idx = memoryStore.conversations.findIndex(c => c.id === id && (!userId || c.userId === userId));
    if (idx !== -1) {
      memoryStore.conversations.splice(idx, 1);
      return true;
    }
    return false;
  }
};
