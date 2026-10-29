-- ============================================================================
-- UNIKORN360: STEP 1B — STRICT EVALUATOR ACTIVITY PROJECTION & NOTES PRIVACY
-- Migration: 20261031_strict_evaluator_projection_and_notes_privacy.sql
--
-- Purpose:
-- 1. Replace keyword-blacklist activity_log filtering in SQL with a strict
--    event-type allowlist + synthetic fixed-summary projection so free-text
--    action, details, notes, actor_email, and nested objects are never copied
--    into evaluator-visible history.
-- 2. Validate event identifiers (^[A-Za-z0-9_-]{1,64}$) and ISO-8601
--    timestamps before emitting evaluator activity items, and preserve exact
--    array ordering via WITH ORDINALITY.
-- 3. Exclude internal admin_notes (in addition to payments and ip_hash) from
--    public.get_creator_applications_for_evaluator().
-- 4. Preserve applied migration history (20261028_*, 20261029_*, 20261030_*),
--    stored audit history in public.creator_applications.activity_log, exact
--    column types, SECURITY DEFINER search_path hardening, and privilege grants.
-- ============================================================================

BEGIN;

-- 1. Strict ISO-8601 timestamp validator helper for evaluator activity projection
--    Requires both strict ISO-8601 lexical format and valid PostgreSQL timestamptz
--    calendar parsing so arbitrary strings or invalid dates are rejected.
CREATE OR REPLACE FUNCTION public.is_valid_iso8601_timestamptz(ts_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = public, pg_temp
AS $$
BEGIN
    IF ts_text IS NULL OR ts_text !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$' THEN
        RETURN FALSE;
    END IF;

    PERFORM ts_text::timestamptz;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.is_valid_iso8601_timestamptz(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_valid_iso8601_timestamptz(TEXT) TO authenticated;

-- 2. Strict allowlist-based activity_log projection for evaluator responses
--    Approved event_type -> Fixed display text contract:
--      application_submitted -> 'Application submitted'
--      status_updated        -> 'Application status updated'
--      campaigns_updated     -> 'Campaign assignments updated'
--      evaluation_submitted  -> 'Creator evaluation submitted'
--    Never copies original action, details, actor_email, notes, or nested fields.
CREATE OR REPLACE FUNCTION public.filter_activity_log_for_evaluator(raw_log JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
    SELECT CASE
        WHEN raw_log IS NULL OR jsonb_typeof(raw_log) <> 'array' THEN '[]'::jsonb
        ELSE COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', elem->>'id',
                        'event_type', elem->>'event_type',
                        'action', CASE elem->>'event_type'
                            WHEN 'application_submitted' THEN 'Application submitted'
                            WHEN 'status_updated' THEN 'Application status updated'
                            WHEN 'campaigns_updated' THEN 'Campaign assignments updated'
                            WHEN 'evaluation_submitted' THEN 'Creator evaluation submitted'
                        END,
                        'timestamp', elem->>'timestamp'
                    )
                    ORDER BY ord ASC
                )
                FROM jsonb_array_elements(
                    CASE WHEN jsonb_typeof(raw_log) = 'array' THEN raw_log ELSE '[]'::jsonb END
                ) WITH ORDINALITY AS t(elem, ord)
                WHERE jsonb_typeof(elem) = 'object'
                  AND jsonb_typeof(elem->'id') = 'string'
                  AND (elem->>'id') ~ '^[A-Za-z0-9_-]{1,64}$'
                  AND jsonb_typeof(elem->'event_type') = 'string'
                  AND (elem->>'event_type') IN (
                      'application_submitted',
                      'status_updated',
                      'campaigns_updated',
                      'evaluation_submitted'
                  )
                  AND jsonb_typeof(elem->'timestamp') = 'string'
                  AND public.is_valid_iso8601_timestamptz(elem->>'timestamp')
            ),
            '[]'::jsonb
        )
    END;
$$;

REVOKE ALL ON FUNCTION public.filter_activity_log_for_evaluator(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.filter_activity_log_for_evaluator(JSONB) TO authenticated;

-- 3. Replace get_creator_applications_for_evaluator() to exclude admin_notes,
--    payments, and ip_hash while preserving exact column types and security checks.
--    Note: Dropping without CASCADE after confirming no views/policies depend on it,
--    because PostgreSQL requires DROP FUNCTION when RETURNS TABLE columns change.
DROP FUNCTION IF EXISTS public.get_creator_applications_for_evaluator();

CREATE OR REPLACE FUNCTION public.get_creator_applications_for_evaluator()
RETURNS TABLE (
    id UUID,
    application_reference VARCHAR(50),
    full_name VARCHAR(255),
    whatsapp_number VARCHAR(30),
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
    average_views VARCHAR(50),
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
    application_status VARCHAR(30),
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
        RAISE EXCEPTION 'Access denied: Administrator membership required';
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
        ca.privacy_consent,
        ca.contact_consent,
        ca.brand_sharing_consent,
        ca.application_status,
        ca.campaign_matches,
        public.filter_activity_log_for_evaluator(ca.activity_log) AS activity_log,
        ca.latest_score,
        ca.created_at,
        ca.updated_at
    FROM public.creator_applications ca
    ORDER BY ca.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_creator_applications_for_evaluator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_creator_applications_for_evaluator() TO authenticated;

COMMIT;
