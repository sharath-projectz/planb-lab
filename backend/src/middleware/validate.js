import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const workflowCreateSchema = z.object({
  name: z.string().min(3, 'Workflow name must be at least 3 characters'),
  category: z.string().optional().default('General'),
  description: z.string().optional().default(''),
  components: z.array(z.object({
    id: z.string(),
    stepNumber: z.number().int().positive(),
    name: z.string().min(2),
    description: z.string().optional(),
    failureProb: z.number().min(0).max(1),
    dependencies: z.array(z.string()).default([]),
    canFallback: z.boolean().default(false),
    allowedFallbacks: z.array(z.string()).default([])
  })).min(1, 'Workflow must contain at least 1 component')
});

export const simulationRunSchema = z.object({
  workflowId: z.string().optional(),
  activeFailures: z.array(z.string()).default([]),
  enabledContingencies: z.array(z.string()).default([])
});

export const simulationSuiteSchema = z.object({
  workflowId: z.string().optional(),
  enabledContingencies: z.array(z.string()).default([]),
  limit: z.number().int().min(1).max(30).optional().default(15)
});

export const retestSchema = z.object({
  workflowId: z.string().optional(),
  baselineContingencies: z.array(z.string()).default([]),
  retestContingencies: z.array(z.string()).default([])
});

export const copilotChatSchema = z.object({
  conversationId: z.string().optional(),
  workflowId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  workflowState: z.record(z.any()).optional(),
  simulationContext: z.record(z.any()).optional()
});

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(400).json({ error: 'Malformed Request' });
    }
  };
}
