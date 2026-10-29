-- UNIKORN360 SECURITY REPAIR STEP 1A:
-- Migration: 20261030_fix_evaluator_rpc_and_activity_leak.sql
-- Purpose:
-- 1. Correct column return types and explicit casts in get_creator_applications_for_evaluator()
--    to match public.creator_applications exactly (including latest_score NUMERIC(5,2) and VARCHAR lengths).
-- 2. Filter financial activity events from activity_log inside get_creator_applications_for_evaluator()
--    using structured event_type allowlisting and financial-detail scrubbing so direct DB RPC calls
--    cannot leak payment amounts, transaction references (UTR), or payment notes to evaluators.
-- 3. Enforce controlled search_path, schema-qualified references, caller membership checks,
--    and least-privilege EXECUTE grants on security-definer functions.

BEGIN;

-- 1. Harden existing role-check helper functions with controlled search_path, schema qualification, and EXECUTE privileges
CREATE OR REPLACE FUNCTION public.is_creator_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.creator_admin_users cau
        WHERE cau.authenticated_user_id = auth.uid()
          AND cau.role IN ('superadmin', 'admin', 'evaluator')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.creator_admin_users cau
        WHERE cau.authenticated_user_id = auth.uid()
          AND cau.role IN ('superadmin', 'admin')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.creator_admin_users cau
        WHERE cau.authenticated_user_id = auth.uid()
          AND cau.role = 'superadmin'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.is_creator_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_creator_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin_or_superadmin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_superadmin() TO authenticated;

REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

-- 2. Immutable helper function (INVOKER security) to project non-financial activity_log entries for evaluators
CREATE OR REPLACE FUNCTION public.filter_activity_log_for_evaluator(raw_log JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', elem->'id',
                'event_type', COALESCE(elem->'event_type', to_jsonb('legacy_event'::text)),
                'action', elem->'action',
                'actor_email', elem->'actor_email',
                'timestamp', elem->'timestamp',
                'details', elem->'details'
            )
        ),
        '[]'::jsonb
    )
    FROM jsonb_array_elements(
        CASE
            WHEN raw_log IS NOT NULL AND jsonb_typeof(raw_log) = 'array' THEN raw_log
            ELSE '[]'::jsonb
        END
    ) AS elem
    WHERE jsonb_typeof(elem) = 'object'
      -- Structured event_type allowlist when event_type is present
      AND (
          (elem ? 'event_type' AND (elem->>'event_type') IN (
              'application_submitted',
              'status_updated',
              'campaigns_updated',
              'evaluation_submitted'
          ))
          OR (
              NOT (elem ? 'event_type')
              AND COALESCE(elem->>'action', '') !~* '(payment|paid|payout|utr|remittance|invoice|₹|inr)'
          )
      )
      -- Defense-in-depth: never emit any entry containing financial keys or payment/UTR markers
      AND NOT (elem ?| ARRAY['amount', 'reference_utr', 'payment_date', 'payment', 'payments', 'utr'])
      AND COALESCE(elem->>'action', '') !~* '(payment|paid|payout|utr|remittance|invoice|₹)'
      AND COALESCE(elem->>'details', '') !~* '(payment|payout|utr|reference_utr|remittance|invoice|₹)';
$$;

REVOKE ALL ON FUNCTION public.filter_activity_log_for_evaluator(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.filter_activity_log_for_evaluator(JSONB) TO authenticated;

-- 3. Drop and recreate get_creator_applications_for_evaluator() transactionally
--    Dependency check: no views, triggers, or policies depend on get_creator_applications_for_evaluator().
DROP FUNCTION IF EXISTS public.get_creator_applications_for_evaluator();

CREATE OR REPLACE FUNCTION public.get_creator_applications_for_evaluator()
RETURNS TABLE (
    id UUID,
    application_reference VARCHAR(50),
    full_name VARCHAR(255),
    whatsapp_number VARCHAR(50),
    email VARCHAR(255),
    state VARCHAR(100),
    district VARCHAR(100),
    town VARCHAR(150),
    contact_language VARCHAR(50),
    social_platforms JSONB,
    instagram_url TEXT,
    youtube_url TEXT,
    other_profile_urls JSONB,
    follower_count VARCHAR(50),
    subscriber_count VARCHAR(50),
    average_views VARCHAR(100),
    publishing_frequency VARCHAR(100),
    creator_categories JSONB,
    languages JSONB,
    dialects JSONB,
    creator_classification VARCHAR(50),
    audience_location TEXT,
    audience_insights JSONB,
    collaboration_preferences JSONB,
    expected_rates JSONB,
    travel_availability VARCHAR(100),
    previous_collaborations JSONB,
    portfolio_urls JSONB,
    privacy_consent BOOLEAN,
    contact_consent BOOLEAN,
    brand_sharing_consent BOOLEAN,
    application_status VARCHAR(50),
    admin_notes TEXT,
    campaign_matches JSONB,
    activity_log JSONB,
    latest_score NUMERIC(5,2),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_creator_admin() THEN
        RAISE EXCEPTION 'Forbidden: valid creator_admin_users membership required.'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        ca.id::UUID,
        ca.application_reference::VARCHAR(50),
        ca.full_name::VARCHAR(255),
        ca.whatsapp_number::VARCHAR(50),
        ca.email::VARCHAR(255),
        ca.state::VARCHAR(100),
        ca.district::VARCHAR(100),
        ca.town::VARCHAR(150),
        ca.contact_language::VARCHAR(50),
        ca.social_platforms::JSONB,
        ca.instagram_url::TEXT,
        ca.youtube_url::TEXT,
        ca.other_profile_urls::JSONB,
        ca.follower_count::VARCHAR(50),
        ca.subscriber_count::VARCHAR(50),
        ca.average_views::VARCHAR(100),
        ca.publishing_frequency::VARCHAR(100),
        ca.creator_categories::JSONB,
        ca.languages::JSONB,
        ca.dialects::JSONB,
        ca.creator_classification::VARCHAR(50),
        ca.audience_location::TEXT,
        ca.audience_insights::JSONB,
        ca.collaboration_preferences::JSONB,
        ca.expected_rates::JSONB,
        ca.travel_availability::VARCHAR(100),
        ca.previous_collaborations::JSONB,
        ca.portfolio_urls::JSONB,
        ca.privacy_consent::BOOLEAN,
        ca.contact_consent::BOOLEAN,
        ca.brand_sharing_consent::BOOLEAN,
        ca.application_status::VARCHAR(50),
        ca.admin_notes::TEXT,
        ca.campaign_matches::JSONB,
        public.filter_activity_log_for_evaluator(ca.activity_log)::JSONB AS activity_log,
        ca.latest_score::NUMERIC(5,2),
        ca.created_at::TIMESTAMPTZ,
        ca.updated_at::TIMESTAMPTZ
    FROM public.creator_applications ca
    ORDER BY ca.created_at DESC;
END;
$$;

-- Restrict execution privileges strictly to authenticated users (caller membership is verified inside function)
REVOKE ALL ON FUNCTION public.get_creator_applications_for_evaluator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_creator_applications_for_evaluator() TO authenticated;

COMMIT;
