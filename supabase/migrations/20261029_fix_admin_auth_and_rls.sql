-- UNIKORN360 SECURITY REPAIR: ADMIN AUTHENTICATION, AUTHORIZATION & RLS
-- Migration: 20261029_fix_admin_auth_and_rls.sql
-- Purpose:
-- 1. Remove insecure "TO authenticated USING (true)" policies from service catalogue.
-- 2. Restrict service catalogue mutations strictly to superadmin and admin roles.
-- 3. Enforce granular permissions across creator tables (superadmin, admin, evaluator),
--    including database-level protection of creator_applications.payments.
-- 4. Secure creator_admin_users so members cannot self-promote or enumerate all admins.
-- 5. Preserve public read-only access for published services with published parent divisions.

BEGIN;

-- 1. Ensure creator_admin_users has the canonical roles
ALTER TABLE IF EXISTS creator_admin_users
    DROP CONSTRAINT IF EXISTS creator_admin_users_role_check;

ALTER TABLE IF EXISTS creator_admin_users
    ADD CONSTRAINT creator_admin_users_role_check
    CHECK (role IN ('superadmin', 'admin', 'evaluator'));

-- 2. Security Definer Helper Functions (Run with table owner privileges, preventing recursion)
CREATE OR REPLACE FUNCTION is_creator_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM creator_admin_users
        WHERE authenticated_user_id = auth.uid()
          AND role IN ('superadmin', 'admin', 'evaluator')
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin_or_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM creator_admin_users
        WHERE authenticated_user_id = auth.uid()
          AND role IN ('superadmin', 'admin')
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM creator_admin_users
        WHERE authenticated_user_id = auth.uid()
          AND role = 'superadmin'
    );
END;
$$;

-- 3. REPAIR SERVICE CATALOGUE RLS
-- Drop old insecure policies
DROP POLICY IF EXISTS "Admins have full access to divisions" ON service_divisions;
DROP POLICY IF EXISTS "Admins have full access to catalog" ON service_catalog;
DROP POLICY IF EXISTS "Admins have full access to relations" ON service_relations;
DROP POLICY IF EXISTS "Public can view published divisions" ON service_divisions;
DROP POLICY IF EXISTS "Public can view published services" ON service_catalog;
DROP POLICY IF EXISTS "Public can view active relations" ON service_relations;

-- Drop any previous granular policies to ensure idempotent recreation
DROP POLICY IF EXISTS "Public and users can view published divisions" ON service_divisions;
DROP POLICY IF EXISTS "Admins can view all divisions" ON service_divisions;
DROP POLICY IF EXISTS "Admins can insert divisions" ON service_divisions;
DROP POLICY IF EXISTS "Admins can update divisions" ON service_divisions;
DROP POLICY IF EXISTS "Superadmins can delete divisions" ON service_divisions;

DROP POLICY IF EXISTS "Public and users can view published services" ON service_catalog;
DROP POLICY IF EXISTS "Admins can view all services" ON service_catalog;
DROP POLICY IF EXISTS "Admins can insert services" ON service_catalog;
DROP POLICY IF EXISTS "Admins can update services" ON service_catalog;
DROP POLICY IF EXISTS "Superadmins can delete services" ON service_catalog;

DROP POLICY IF EXISTS "Public and users can view active relations" ON service_relations;
DROP POLICY IF EXISTS "Admins can view all relations" ON service_relations;
DROP POLICY IF EXISTS "Admins can insert relations" ON service_relations;
DROP POLICY IF EXISTS "Admins can update relations" ON service_relations;
DROP POLICY IF EXISTS "Superadmins can delete relations" ON service_relations;

-- A. Service Divisions
CREATE POLICY "Public and users can view published divisions"
    ON service_divisions FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can view all divisions"
    ON service_divisions FOR SELECT
    TO authenticated
    USING (is_admin_or_superadmin());

CREATE POLICY "Admins can insert divisions"
    ON service_divisions FOR INSERT
    TO authenticated
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admins can update divisions"
    ON service_divisions FOR UPDATE
    TO authenticated
    USING (is_admin_or_superadmin())
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Superadmins can delete divisions"
    ON service_divisions FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- B. Service Catalog
CREATE POLICY "Public and users can view published services"
    ON service_catalog FOR SELECT
    USING (
        status = 'published' AND
        division_id IN (
            SELECT id FROM service_divisions WHERE status = 'published'
        )
    );

CREATE POLICY "Admins can view all services"
    ON service_catalog FOR SELECT
    TO authenticated
    USING (is_admin_or_superadmin());

CREATE POLICY "Admins can insert services"
    ON service_catalog FOR INSERT
    TO authenticated
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admins can update services"
    ON service_catalog FOR UPDATE
    TO authenticated
    USING (is_admin_or_superadmin())
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Superadmins can delete services"
    ON service_catalog FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- C. Service Relations
CREATE POLICY "Public and users can view active relations"
    ON service_relations FOR SELECT
    USING (
        service_id IN (
            SELECT sc.id FROM service_catalog sc
            JOIN service_divisions sd ON sd.id = sc.division_id
            WHERE sc.status = 'published' AND sd.status = 'published'
        ) AND
        related_service_id IN (
            SELECT sc.id FROM service_catalog sc
            JOIN service_divisions sd ON sd.id = sc.division_id
            WHERE sc.status = 'published' AND sd.status = 'published'
        )
    );

CREATE POLICY "Admins can view all relations"
    ON service_relations FOR SELECT
    TO authenticated
    USING (is_admin_or_superadmin());

CREATE POLICY "Admins can insert relations"
    ON service_relations FOR INSERT
    TO authenticated
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admins can update relations"
    ON service_relations FOR UPDATE
    TO authenticated
    USING (is_admin_or_superadmin())
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Superadmins can delete relations"
    ON service_relations FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- 4. REPAIR CREATOR NETWORK RLS & FIELD-LEVEL PRIVACY
DROP POLICY IF EXISTS "Admins can view creator applications" ON creator_applications;
DROP POLICY IF EXISTS "Admins can update creator applications" ON creator_applications;
DROP POLICY IF EXISTS "Admins can delete creator applications" ON creator_applications;

-- Direct table SELECT is restricted to superadmin and admin so evaluators cannot query `payments` directly via PostgREST.
CREATE POLICY "Admins can view creator applications"
    ON creator_applications FOR SELECT
    TO authenticated
    USING (is_admin_or_superadmin());

-- Update: Superadmin and Admin only. Evaluators CANNOT update status, notes, or campaigns.
CREATE POLICY "Admins can update creator applications"
    ON creator_applications FOR UPDATE
    TO authenticated
    USING (is_admin_or_superadmin())
    WITH CHECK (is_admin_or_superadmin());

-- Delete: Superadmin ONLY. Admins and Evaluators CANNOT delete applications.
CREATE POLICY "Admins can delete creator applications"
    ON creator_applications FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- Column-level guard trigger: prevent non-superadmins from modifying `payments` on direct database updates
CREATE OR REPLACE FUNCTION enforce_creator_applications_column_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- When invoked by an authenticated PostgREST session (auth.uid() IS NOT NULL),
    -- only superadmin may modify the payments JSONB column.
    IF auth.uid() IS NOT NULL AND (NEW.payments IS DISTINCT FROM OLD.payments) THEN
        IF NOT is_superadmin() THEN
            RAISE EXCEPTION 'Permission denied: only superadmin may modify creator payment records.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_creator_applications_column_permissions ON creator_applications;
CREATE TRIGGER trg_enforce_creator_applications_column_permissions
    BEFORE UPDATE ON creator_applications
    FOR EACH ROW
    EXECUTE FUNCTION enforce_creator_applications_column_permissions();

-- Safe RPC for evaluators (and admins) to read creator applications without `payments` or `ip_hash`
CREATE OR REPLACE FUNCTION get_creator_applications_for_evaluator()
RETURNS TABLE (
    id UUID,
    application_reference TEXT,
    full_name TEXT,
    whatsapp_number TEXT,
    email TEXT,
    state TEXT,
    district TEXT,
    town TEXT,
    contact_language TEXT,
    social_platforms JSONB,
    instagram_url TEXT,
    youtube_url TEXT,
    other_profile_urls JSONB,
    follower_count TEXT,
    subscriber_count TEXT,
    average_views TEXT,
    publishing_frequency TEXT,
    creator_categories JSONB,
    languages JSONB,
    dialects JSONB,
    creator_classification TEXT,
    audience_location TEXT,
    audience_insights JSONB,
    collaboration_preferences JSONB,
    expected_rates JSONB,
    travel_availability TEXT,
    previous_collaborations JSONB,
    portfolio_urls JSONB,
    application_status TEXT,
    admin_notes TEXT,
    campaign_matches JSONB,
    activity_log JSONB,
    latest_score INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_creator_admin() THEN
        RAISE EXCEPTION 'Forbidden: valid creator_admin_users membership required.';
    END IF;

    RETURN QUERY
    SELECT
        ca.id,
        ca.application_reference,
        ca.full_name,
        ca.whatsapp_number,
        ca.email,
        ca.state,
        ca.district,
        ca.town,
        ca.contact_language,
        ca.social_platforms,
        ca.instagram_url,
        ca.youtube_url,
        ca.other_profile_urls,
        ca.follower_count,
        ca.subscriber_count,
        ca.average_views,
        ca.publishing_frequency,
        ca.creator_categories,
        ca.languages,
        ca.dialects,
        ca.creator_classification,
        ca.audience_location,
        ca.audience_insights,
        ca.collaboration_preferences,
        ca.expected_rates,
        ca.travel_availability,
        ca.previous_collaborations,
        ca.portfolio_urls,
        ca.application_status,
        ca.admin_notes,
        ca.campaign_matches,
        ca.activity_log,
        ca.latest_score,
        ca.created_at,
        ca.updated_at
    FROM creator_applications ca
    ORDER BY ca.created_at DESC;
END;
$$;

-- Creator Assets
DROP POLICY IF EXISTS "Admins can view creator assets" ON creator_assets;
DROP POLICY IF EXISTS "Admins can delete creator assets" ON creator_assets;
DROP POLICY IF EXISTS "Superadmins can delete creator assets" ON creator_assets;

CREATE POLICY "Admins can view creator assets"
    ON creator_assets FOR SELECT
    TO authenticated
    USING (is_creator_admin());

CREATE POLICY "Superadmins can delete creator assets"
    ON creator_assets FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- Creator Admin Users (Membership table protection - no self-service promotion)
DROP POLICY IF EXISTS "Admins can view admin users" ON creator_admin_users;
DROP POLICY IF EXISTS "Superadmins can insert admin users" ON creator_admin_users;
DROP POLICY IF EXISTS "Superadmins can update admin users" ON creator_admin_users;
DROP POLICY IF EXISTS "Superadmins can delete admin users" ON creator_admin_users;

CREATE POLICY "Admins can view admin users"
    ON creator_admin_users FOR SELECT
    TO authenticated
    USING (authenticated_user_id = auth.uid() OR is_superadmin());

CREATE POLICY "Superadmins can insert admin users"
    ON creator_admin_users FOR INSERT
    TO authenticated
    WITH CHECK (is_superadmin());

CREATE POLICY "Superadmins can update admin users"
    ON creator_admin_users FOR UPDATE
    TO authenticated
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

CREATE POLICY "Superadmins can delete admin users"
    ON creator_admin_users FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- Creator Evaluations
DROP POLICY IF EXISTS "Admins can view evaluations" ON creator_evaluations;
DROP POLICY IF EXISTS "Admins can insert evaluations" ON creator_evaluations;
DROP POLICY IF EXISTS "Admins can update evaluations" ON creator_evaluations;
DROP POLICY IF EXISTS "Superadmins can delete evaluations" ON creator_evaluations;

CREATE POLICY "Admins can view evaluations"
    ON creator_evaluations FOR SELECT
    TO authenticated
    USING (is_creator_admin());

CREATE POLICY "Admins can insert evaluations"
    ON creator_evaluations FOR INSERT
    TO authenticated
    WITH CHECK (is_creator_admin());

CREATE POLICY "Admins can update evaluations"
    ON creator_evaluations FOR UPDATE
    TO authenticated
    USING (is_admin_or_superadmin())
    WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Superadmins can delete evaluations"
    ON creator_evaluations FOR DELETE
    TO authenticated
    USING (is_superadmin());

-- Storage objects protection
DROP POLICY IF EXISTS "Admins can delete creator submission objects" ON storage.objects;
DROP POLICY IF EXISTS "Superadmins can delete creator submission objects" ON storage.objects;
CREATE POLICY "Superadmins can delete creator submission objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'creator-submissions'
        AND is_superadmin()
    );

COMMIT;
