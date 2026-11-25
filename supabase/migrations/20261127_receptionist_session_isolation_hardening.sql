-- INBOX360 — SESSION ISOLATION & DELIVERY DIAGNOSTICS HARDENING
-- Non-destructive additive migration: preserves all historical conversation and
-- message records while optimizing composite channel/mode sorting and failed
-- Live AI delivery queries.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_channel_mode_last_message
  ON public.receptionist_conversations (source_channel, source_mode, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_receptionist_messages_conversation_delivery_created
  ON public.receptionist_messages (conversation_id, delivery_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_receptionist_messages_failed_delivery
  ON public.receptionist_messages (created_at DESC)
  WHERE delivery_status = 'failed';

COMMIT;
