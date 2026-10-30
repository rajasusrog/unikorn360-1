-- Migration 20261104: Creator Upload Sessions Table & Constraints

CREATE TABLE IF NOT EXISTS creator_upload_sessions (
    id VARCHAR(128) PRIMARY KEY,
    submission_secret VARCHAR(128) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'registered', 'verified', 'consumed', 'completed', 'expired')),
    application_id UUID REFERENCES creator_applications(id) ON DELETE SET NULL,
    assets JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creator_upload_sessions_status ON creator_upload_sessions(status);
CREATE INDEX IF NOT EXISTS idx_creator_upload_sessions_app_id ON creator_upload_sessions(application_id);

ALTER TABLE creator_upload_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on upload sessions" ON creator_upload_sessions;
CREATE POLICY "Service role full access on upload sessions"
    ON creator_upload_sessions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
