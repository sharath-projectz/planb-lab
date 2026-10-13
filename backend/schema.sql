-- =================================================================
-- PLANB LAB Database Schema (Supabase PostgreSQL)
-- Decision Intelligence & Workflow Resiliency Simulation
-- =================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    nodes JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    contingencies JSONB DEFAULT '[]'::jsonb,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SIMULATION RUNS & RESULTS TABLE
CREATE TABLE IF NOT EXISTS simulation_runs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workflow_id TEXT REFERENCES workflows(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    mode TEXT NOT NULL, -- 'baseline' | 'retest'
    tested_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    active_contingencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_scenarios_tested INT NOT NULL DEFAULT 0,
    successful_scenarios INT NOT NULL DEFAULT 0,
    degraded_scenarios INT NOT NULL DEFAULT 0,
    blocked_scenarios INT NOT NULL DEFAULT 0,
    resilience_score NUMERIC NOT NULL DEFAULT 0,
    plan_health TEXT DEFAULT 'High Risk',
    scenario_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS chat_conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workflow_id TEXT REFERENCES workflows(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
    message TEXT NOT NULL,
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_workflow_id ON simulation_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- 6. SEED DEMO ACCOUNT (demo@planblab.io / demo12345)
INSERT INTO users (id, email, password_hash, name)
VALUES (
    'demo-user-001',
    'demo@planblab.io',
    '$2a$10$NV6OqYlBKJpL.l/pyzEqfO9dqzcfrpvsWYVcplFu2vdzIDz1Mo10G',
    'Dr. Evelyn Carter (Decision Lead)'
) ON CONFLICT (email) DO NOTHING;

