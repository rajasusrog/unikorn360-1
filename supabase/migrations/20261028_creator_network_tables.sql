-- UNIKORN360 CREATOR NETWORK SCHEMA MIGRATION
-- Tables: creator_applications, creator_assets, creator_admin_users, creator_evaluations
-- Storage: creator-submissions (Private bucket)
-- Security: Full Row Level Security (RLS), Indexes, and RBAC

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. CREATOR APPLICATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS creator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_reference VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    district VARCHAR(100) NOT NULL,
    town VARCHAR(150) NOT NULL,
    contact_language VARCHAR(50) NOT NULL DEFAULT 'Tamil',
    social_platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
    instagram_url TEXT,
    youtube_url TEXT,
    other_profile_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    follower_count VARCHAR(50),
    subscriber_count VARCHAR(50),
    average_views VARCHAR(100),
    publishing_frequency VARCHAR(100),
    creator_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    dialects JSONB NOT NULL DEFAULT '[]'::jsonb,
    creator_classification VARCHAR(50) NOT NULL CHECK (creator_classification IN ('l1_community', 'l2_nano', 'l3_micro', 'l4_regional', 'l5_mid_tier', 'l6_established', 'ugc', 'nano', 'micro', 'mid', 'macro')),
    audience_location TEXT,
    audience_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
    collaboration_preferences JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_rates JSONB NOT NULL DEFAULT '{}'::jsonb,
    travel_availability VARCHAR(100),
    previous_collaborations JSONB NOT NULL DEFAULT '{}'::jsonb,
    portfolio_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    privacy_consent BOOLEAN NOT NULL DEFAULT false,
    contact_consent BOOLEAN NOT NULL DEFAULT false,
    brand_sharing_consent BOOLEAN NOT NULL DEFAULT false,
    application_status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (application_status IN ('new', 'reviewing', 'shortlisted', 'approved', 'rejected', 'inactive', 'pending', 'reviewed')),
    admin_notes TEXT,
    campaign_matches JSONB NOT NULL DEFAULT '[]'::jsonb,
    payments JSONB NOT NULL DEFAULT '[]'::jsonb,
    activity_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    latest_score NUMERIC(5,2) DEFAULT NULL,
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast querying, filtering, and duplicate checking
CREATE INDEX IF NOT EXISTS idx_creator_apps_ref ON creator_applications(application_reference);
CREATE INDEX IF NOT EXISTS idx_creator_apps_email ON creator_applications(email);
CREATE INDEX IF NOT EXISTS idx_creator_apps_phone ON creator_applications(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_creator_apps_district ON creator_applications(district);
CREATE INDEX IF NOT EXISTS idx_creator_apps_status ON creator_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_creator_apps_classification ON creator_applications(creator_classification);
CREATE INDEX IF NOT EXISTS idx_creator_apps_latest_score ON creator_applications(latest_score);
CREATE INDEX IF NOT EXISTS idx_creator_apps_created_at ON creator_applications(created_at DESC);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_creator_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_creator_applications_updated ON creator_applications;
CREATE TRIGGER trg_creator_applications_updated
    BEFORE UPDATE ON creator_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_application_timestamp();

-- ====================================================================
-- 2. CREATOR ASSETS TABLE (Private uploaded media files)
-- ====================================================================
CREATE TABLE IF NOT EXISTS creator_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES creator_applications(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('video_sample', 'audience_insight', 'media_kit')),
    original_filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_assets_app_id ON creator_assets(application_id);
CREATE INDEX IF NOT EXISTS idx_creator_assets_file_type ON creator_assets(file_type);

-- ====================================================================
-- 3. CREATOR ADMIN USERS TABLE (Role-Based Access for Evaluators & Admins)
-- ====================================================================
CREATE TABLE IF NOT EXISTS creator_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authenticated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'evaluator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_admin_users_auth_id ON creator_admin_users(authenticated_user_id);

-- ====================================================================
-- 4. CREATOR EVALUATIONS TABLE (100-Point Unicorn Creator Score Rubric)
-- ====================================================================
CREATE TABLE IF NOT EXISTS creator_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES creator_applications(id) ON DELETE CASCADE,
    engagement_quality INTEGER CHECK (engagement_quality BETWEEN 0 AND 15),     -- Weight 15
    average_views_score INTEGER CHECK (average_views_score BETWEEN 0 AND 10),    -- Weight 10
    content_quality INTEGER CHECK (content_quality BETWEEN 0 AND 10),            -- Weight 10
    authenticity INTEGER CHECK (authenticity BETWEEN 0 AND 10),                  -- Weight 10
    presentation INTEGER CHECK (presentation BETWEEN 0 AND 10),                  -- Weight 10
    audience_brand_fit INTEGER CHECK (audience_brand_fit BETWEEN 0 AND 15),      -- Weight 15
    local_relevance INTEGER CHECK (local_relevance BETWEEN 0 AND 10),            -- Weight 10
    historical_performance INTEGER CHECK (historical_performance BETWEEN 0 AND 10), -- Weight 10
    cost_efficiency INTEGER CHECK (cost_efficiency BETWEEN 0 AND 5),              -- Weight 5
    reliability INTEGER CHECK (reliability BETWEEN 0 AND 5),                      -- Weight 5
    total_score NUMERIC(5,2) CHECK (total_score BETWEEN 0 AND 100),
    evaluation_notes TEXT,
    evaluated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    evaluated_by_name VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_evaluations_app_id ON creator_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_creator_evaluations_evaluator ON creator_evaluations(evaluated_by);

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_evaluations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authorized creator admin
CREATE OR REPLACE FUNCTION is_creator_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM creator_admin_users
        WHERE authenticated_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- creator_applications:
-- Public visitors have ZERO direct SELECT, UPDATE, DELETE permissions.
-- Only verified admins can view or update. Server endpoint uses service_role for inserts.
DROP POLICY IF EXISTS "Admins can view creator applications" ON creator_applications;
CREATE POLICY "Admins can view creator applications"
    ON creator_applications FOR SELECT
    TO authenticated
    USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can update creator applications" ON creator_applications;
CREATE POLICY "Admins can update creator applications"
    ON creator_applications FOR UPDATE
    TO authenticated
    USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can delete creator applications" ON creator_applications;
CREATE POLICY "Admins can delete creator applications"
    ON creator_applications FOR DELETE
    TO authenticated
    USING (is_creator_admin());

-- creator_assets:
DROP POLICY IF EXISTS "Admins can view creator assets" ON creator_assets;
CREATE POLICY "Admins can view creator assets"
    ON creator_assets FOR SELECT
    TO authenticated
    USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can delete creator assets" ON creator_assets;
CREATE POLICY "Admins can delete creator assets"
    ON creator_assets FOR DELETE
    TO authenticated
    USING (is_creator_admin());

-- creator_admin_users:
DROP POLICY IF EXISTS "Admins can view admin users" ON creator_admin_users;
CREATE POLICY "Admins can view admin users"
    ON creator_admin_users FOR SELECT
    TO authenticated
    USING (is_creator_admin());

-- creator_evaluations:
DROP POLICY IF EXISTS "Admins can view evaluations" ON creator_evaluations;
CREATE POLICY "Admins can view evaluations"
    ON creator_evaluations FOR SELECT
    TO authenticated
    USING (is_creator_admin());

DROP POLICY IF EXISTS "Admins can insert evaluations" ON creator_evaluations;
CREATE POLICY "Admins can insert evaluations"
    ON creator_evaluations FOR INSERT
    TO authenticated
    WITH CHECK (is_creator_admin());

DROP POLICY IF EXISTS "Admins can update evaluations" ON creator_evaluations;
CREATE POLICY "Admins can update evaluations"
    ON creator_evaluations FOR UPDATE
    TO authenticated
    USING (is_creator_admin());

-- ====================================================================
-- 6. PRIVATE STORAGE BUCKET: creator-submissions
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'creator-submissions',
    'creator-submissions',
    false, -- strictly private
    31457280, -- 30 MB max
    ARRAY['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 31457280,
    allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'application/pdf'];

-- Storage RLS: Public anonymous download is completely blocked
-- Only authenticated administrators or server-generated signed URLs can access
DROP POLICY IF EXISTS "Admins can view creator submission objects" ON storage.objects;
CREATE POLICY "Admins can view creator submission objects"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'creator-submissions'
        AND is_creator_admin()
    );

DROP POLICY IF EXISTS "Admins can delete creator submission objects" ON storage.objects;
CREATE POLICY "Admins can delete creator submission objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'creator-submissions'
        AND is_creator_admin()
    );
