-- ============================================================
-- Integra Partner Portal — Supabase Schema
-- ============================================================

-- Agents table — stores Elevate sales agent profiles
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT NOT NULL DEFAULT 'Elevate',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Agents can read their own profile
CREATE POLICY "agents_select_own" ON agents
  FOR SELECT USING (auth.uid() = id);

-- Agents can update their own profile
CREATE POLICY "agents_update_own" ON agents
  FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- ELEV-ID Sequence — atomic counter for generating ELEV-IDXXXXX
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS elevate_ref_seq START WITH 1 INCREMENT BY 1;

-- RPC function to get next ELEV-ID number atomically
CREATE OR REPLACE FUNCTION next_elevate_ref()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT nextval('elevate_ref_seq')::INTEGER;
$$;


-- ============================================================
-- Submissions table — stores opportunity submissions
-- One row per submission, one deal per submission
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  elevate_ref TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  account_ref TEXT,
  sites JSONB NOT NULL DEFAULT '[]'::JSONB,
  requirements JSONB NOT NULL DEFAULT '{}'::JSONB,
  urgency TEXT NOT NULL DEFAULT 'standard',
  notes TEXT,
  hubspot_deal_id TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Agents can read their own submissions
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (auth.uid() = agent_id);

-- Agents can insert submissions
CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = agent_id);


-- ============================================================
-- Form drafts table — auto-save in progress form data
-- ============================================================

CREATE TABLE IF NOT EXISTS form_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;

-- Agents can manage their own drafts
CREATE POLICY "drafts_select_own" ON form_drafts
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "drafts_insert_own" ON form_drafts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "drafts_update_own" ON form_drafts
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "drafts_delete_own" ON form_drafts
  FOR DELETE USING (auth.uid() = agent_id);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_submissions_agent ON submissions(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_elevate_ref ON submissions(elevate_ref);
