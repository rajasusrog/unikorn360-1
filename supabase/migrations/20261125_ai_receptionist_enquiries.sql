-- UNIKORN360 AI WEBSITE RECEPTIONIST ENQUIRIES & CONVERSATIONS
-- Migration: 20261125_ai_receptionist_enquiries.sql
-- Stores customer enquiries captured via the AI Website Receptionist along with
-- full conversation transcripts, lead workflow statuses, and follow-up tracking.

BEGIN;

CREATE TABLE IF NOT EXISTS public.receptionist_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL,
  source_mode TEXT NOT NULL DEFAULT 'live' CHECK (source_mode IN ('live', 'demo')),
  detected_language TEXT NOT NULL DEFAULT 'en' CHECK (detected_language IN ('en', 'ta', 'tanglish', 'hi')),
  page_url TEXT,
  customer_name TEXT NOT NULL,
  business_name TEXT,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  service_required TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_range TEXT,
  expected_timeline TEXT,
  lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'follow_up', 'won', 'closed')),
  follow_up_required BOOLEAN NOT NULL DEFAULT TRUE,
  follow_up_notes TEXT,
  follow_up_date DATE,
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receptionist_enquiries_created_at
  ON public.receptionist_enquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_receptionist_enquiries_lead_status
  ON public.receptionist_enquiries (lead_status);

CREATE INDEX IF NOT EXISTS idx_receptionist_enquiries_follow_up
  ON public.receptionist_enquiries (follow_up_required, follow_up_date);

-- Automatically maintain updated_at
CREATE OR REPLACE FUNCTION public.set_receptionist_enquiries_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_receptionist_enquiries_updated_at ON public.receptionist_enquiries;
CREATE TRIGGER trg_receptionist_enquiries_updated_at
  BEFORE UPDATE ON public.receptionist_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_receptionist_enquiries_updated_at();

-- Strict Row-Level Security (public cannot read or modify stored customer enquiries)
ALTER TABLE public.receptionist_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view receptionist enquiries" ON public.receptionist_enquiries;
CREATE POLICY "Admins can view receptionist enquiries"
  ON public.receptionist_enquiries
  FOR SELECT
  TO authenticated
  USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can update receptionist enquiries" ON public.receptionist_enquiries;
CREATE POLICY "Admins can update receptionist enquiries"
  ON public.receptionist_enquiries
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin())
  WITH CHECK (is_admin_or_superadmin());

DROP POLICY IF EXISTS "Superadmins can delete receptionist enquiries" ON public.receptionist_enquiries;
CREATE POLICY "Superadmins can delete receptionist enquiries"
  ON public.receptionist_enquiries
  FOR DELETE
  TO authenticated
  USING (is_superadmin());

COMMIT;
