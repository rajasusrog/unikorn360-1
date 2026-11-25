-- INBOX360 STAGE 3 — PERSISTENT CONVERSATION CRM
-- Migration: 20261126_ai_receptionist_conversations.sql
-- Persists every website (and future WhatsApp) conversation and individual message
-- in Supabase with strict RLS, idempotent message keys, lead/assignee tracking,
-- and automatic timestamp maintenance.

BEGIN;

CREATE TABLE IF NOT EXISTS public.receptionist_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL CHECK (char_length(btrim(session_id)) > 0),
  source_channel TEXT NOT NULL DEFAULT 'website' CHECK (source_channel IN ('website', 'whatsapp')),
  source_mode TEXT NOT NULL DEFAULT 'live' CHECK (source_mode IN ('live', 'demo')),
  customer_identifier TEXT,
  detected_language TEXT NOT NULL DEFAULT 'en' CHECK (detected_language IN ('en', 'ta', 'tanglish', 'hi')),
  current_page TEXT DEFAULT '/',
  conversation_status TEXT NOT NULL DEFAULT 'active' CHECK (
    conversation_status IN ('active', 'new', 'contacted', 'qualified', 'follow_up', 'won', 'closed')
  ),
  assigned_employee TEXT,
  enquiry_id UUID REFERENCES public.receptionist_enquiries(id) ON DELETE SET NULL,
  session_token_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_receptionist_conversations_session_channel_mode
    UNIQUE (session_id, source_channel, source_mode)
);

CREATE TABLE IF NOT EXISTS public.receptionist_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.receptionist_conversations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL CHECK (char_length(btrim(message_id)) > 0),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'assistant', 'agent', 'system')),
  message_content TEXT NOT NULL CHECK (char_length(btrim(message_content)) > 0),
  message_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_model TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'delivered' CHECK (
    delivery_status IN ('received', 'pending', 'sent', 'delivered', 'read', 'failed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_receptionist_messages_conversation_message_id
    UNIQUE (conversation_id, message_id)
);

-- Performance & inbox query indexes
CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_last_message_at
  ON public.receptionist_conversations (last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_channel_mode
  ON public.receptionist_conversations (source_channel, source_mode);

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_status
  ON public.receptionist_conversations (conversation_status);

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_language
  ON public.receptionist_conversations (detected_language);

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_assigned_employee
  ON public.receptionist_conversations (assigned_employee);

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_customer_identifier
  ON public.receptionist_conversations (customer_identifier);

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_enquiry_id
  ON public.receptionist_conversations (enquiry_id);

CREATE INDEX IF NOT EXISTS idx_receptionist_messages_conversation_created
  ON public.receptionist_messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_receptionist_messages_sender_type
  ON public.receptionist_messages (sender_type);

CREATE INDEX IF NOT EXISTS idx_receptionist_messages_created_at
  ON public.receptionist_messages (created_at DESC);

-- Maintain updated_at on conversation updates
CREATE OR REPLACE FUNCTION public.set_receptionist_conversations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_receptionist_conversations_updated_at ON public.receptionist_conversations;
CREATE TRIGGER trg_receptionist_conversations_updated_at
  BEFORE UPDATE ON public.receptionist_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_receptionist_conversations_updated_at();

-- Automatically bump last_message_at and updated_at whenever a message row is inserted
CREATE OR REPLACE FUNCTION public.sync_receptionist_conversation_last_message_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.receptionist_conversations
  SET
    last_message_at = GREATEST(last_message_at, NEW.created_at),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_receptionist_messages_sync_last_message_at ON public.receptionist_messages;
CREATE TRIGGER trg_receptionist_messages_sync_last_message_at
  AFTER INSERT ON public.receptionist_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_receptionist_conversation_last_message_at();

-- Strict Row-Level Security: NO public read or write access
ALTER TABLE public.receptionist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptionist_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.receptionist_conversations FROM anon, PUBLIC;
REVOKE ALL ON public.receptionist_messages FROM anon, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.receptionist_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receptionist_messages TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT ALL PRIVILEGES ON public.receptionist_conversations TO service_role;
    GRANT ALL PRIVILEGES ON public.receptionist_messages TO service_role;
  END IF;
END $$;

-- Conversations policies (existing admin authorization functions)
DROP POLICY IF EXISTS "Admins can view receptionist conversations" ON public.receptionist_conversations;
CREATE POLICY "Admins can view receptionist conversations"
  ON public.receptionist_conversations
  FOR SELECT
  TO authenticated
  USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can insert receptionist conversations" ON public.receptionist_conversations;
CREATE POLICY "Admins can insert receptionist conversations"
  ON public.receptionist_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_superadmin());

DROP POLICY IF EXISTS "Admins can update receptionist conversations" ON public.receptionist_conversations;
CREATE POLICY "Admins can update receptionist conversations"
  ON public.receptionist_conversations
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin())
  WITH CHECK (is_admin_or_superadmin());

DROP POLICY IF EXISTS "Superadmins can delete receptionist conversations" ON public.receptionist_conversations;
CREATE POLICY "Superadmins can delete receptionist conversations"
  ON public.receptionist_conversations
  FOR DELETE
  TO authenticated
  USING (is_superadmin());

-- Messages policies (existing admin authorization functions)
DROP POLICY IF EXISTS "Admins can view receptionist messages" ON public.receptionist_messages;
CREATE POLICY "Admins can view receptionist messages"
  ON public.receptionist_messages
  FOR SELECT
  TO authenticated
  USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can insert receptionist messages" ON public.receptionist_messages;
CREATE POLICY "Admins can insert receptionist messages"
  ON public.receptionist_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_superadmin());

DROP POLICY IF EXISTS "Admins can update receptionist messages" ON public.receptionist_messages;
CREATE POLICY "Admins can update receptionist messages"
  ON public.receptionist_messages
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin())
  WITH CHECK (is_admin_or_superadmin());

DROP POLICY IF EXISTS "Superadmins can delete receptionist messages" ON public.receptionist_messages;
CREATE POLICY "Superadmins can delete receptionist messages"
  ON public.receptionist_messages
  FOR DELETE
  TO authenticated
  USING (is_superadmin());

COMMIT;
