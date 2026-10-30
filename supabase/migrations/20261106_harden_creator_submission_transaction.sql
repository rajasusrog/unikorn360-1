-- Migration 20261106: Harden Creator Submission Transaction RPC
-- 1. Restrict execution strictly to service_role (SECURITY INVOKER, safe search_path)
-- 2. Validate locked session status, expiration, and submission secret inside transaction
-- 3. Strict asset ownership, category matching, byte size limits, and non-reassignable application_id
-- 4. Server-controlled fields: application_status='pending', admin_notes=NULL, server-generated activity_log
-- 5. Remove test parameters from production RPC signature

-- Drop previous version with 6 arguments if it exists
DROP FUNCTION IF EXISTS public.submit_creator_application(VARCHAR, VARCHAR, UUID, JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS public.submit_creator_application(VARCHAR, VARCHAR, UUID, JSONB, JSONB);

CREATE OR REPLACE FUNCTION public.submit_creator_application(
    p_session_id VARCHAR(128),
    p_submission_secret VARCHAR(128),
    p_app_id UUID,
    p_app_data JSONB,
    p_assets JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_session RECORD;
    v_existing RECORD;
    v_email TEXT;
    v_whatsapp TEXT;
    v_target_app_id UUID := p_app_id;
    v_ref TEXT;
    v_asset JSONB;
    v_storage_path TEXT;
    v_file_type TEXT;
    v_file_size BIGINT;
    v_orig_filename TEXT;
    v_mime_type TEXT;
    v_session_asset_obj JSONB;
    v_reg_category TEXT;
    v_existing_asset_app_id UUID;
BEGIN
    -- 1. Validate session parameters
    IF p_session_id IS NULL OR length(trim(p_session_id)) = 0 THEN
        RAISE EXCEPTION 'MISSING_UPLOAD_SESSION: uploadSessionId is required.'
            USING ERRCODE = 'P0001';
    END IF;

    -- 2. Lock session row FOR UPDATE to prevent race conditions
    SELECT * INTO v_session
    FROM public.creator_upload_sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'EXPIRED_SESSION: Upload session does not exist or has expired.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Validate session expiry
    IF v_session.expires_at IS NOT NULL AND v_session.expires_at < now() THEN
        RAISE EXCEPTION 'EXPIRED_SESSION: Upload session has expired at %.', v_session.expires_at
            USING ERRCODE = 'P0001';
    END IF;

    -- Verify submission secret
    IF p_submission_secret IS NULL OR length(trim(p_submission_secret)) = 0 OR v_session.submission_secret != p_submission_secret THEN
        RAISE EXCEPTION 'INVALID_SUBMISSION_SECRET: submissionSecret is missing or invalid for this session.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Preserve idempotency for valid completed submissions on this exact session
    IF v_session.status = 'completed' AND v_session.application_id IS NOT NULL THEN
        SELECT id, application_reference INTO v_existing
        FROM public.creator_applications
        WHERE id = v_session.application_id;

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'already_completed', true,
                'id', v_existing.id,
                'reference_number', v_existing.application_reference,
                'message', 'Application recorded into UNIKORN360 Creator Network pipeline.'
            );
        END IF;
    END IF;

    -- Validate session state
    IF v_session.status = 'expired' THEN
        RAISE EXCEPTION 'EXPIRED_SESSION: Upload session is marked expired.'
            USING ERRCODE = 'P0001';
    END IF;

    IF v_session.status NOT IN ('created', 'registered', 'verified') THEN
        RAISE EXCEPTION 'INVALID_SESSION_STATE: Session status "%" is not valid for submission.', v_session.status
            USING ERRCODE = 'P0001';
    END IF;

    -- 3. Duplicate checks & applicant binding
    v_email := lower(trim(p_app_data->>'email'));
    v_whatsapp := regexp_replace(p_app_data->>'whatsapp_number', '[\s-]+', '', 'g');

    SELECT id, application_reference INTO v_existing
    FROM public.creator_applications
    WHERE (lower(trim(email)) = v_email OR regexp_replace(whatsapp_number, '[\s-]+', '', 'g') = v_whatsapp)
      AND application_status != 'rejected'
    LIMIT 1;

    IF FOUND THEN
        -- Check if this session was ALREADY bound to this existing application (Authorized Retry)
        IF v_session.application_id IS NOT NULL AND v_session.application_id = v_existing.id THEN
            v_target_app_id := v_existing.id;
            v_ref := v_existing.application_reference;
        ELSE
            -- Unrelated session attempting to attach to existing applicant
            RAISE EXCEPTION 'DUPLICATE_APPLICATION: An application already exists for this email address or phone number. Un-authorized modification or file attachment is forbidden.'
                USING ERRCODE = 'P0001';
        END IF;
    ELSE
        -- 4. Insert application with strictly server-controlled fields
        v_ref := p_app_data->>'application_reference';

        INSERT INTO public.creator_applications (
            id,
            application_reference,
            full_name,
            whatsapp_number,
            email,
            state,
            district,
            town,
            contact_language,
            social_platforms,
            instagram_url,
            youtube_url,
            other_profile_urls,
            follower_count,
            subscriber_count,
            average_views,
            publishing_frequency,
            creator_categories,
            languages,
            dialects,
            creator_classification,
            audience_location,
            audience_insights,
            collaboration_preferences,
            expected_rates,
            travel_availability,
            previous_collaborations,
            portfolio_urls,
            privacy_consent,
            contact_consent,
            brand_sharing_consent,
            application_status,
            admin_notes,
            campaign_matches,
            payments,
            activity_log,
            latest_score,
            ip_hash
        ) VALUES (
            v_target_app_id,
            v_ref,
            trim(p_app_data->>'full_name'),
            v_whatsapp,
            v_email,
            COALESCE(p_app_data->>'state', 'Tamil Nadu'),
            p_app_data->>'district',
            trim(p_app_data->>'town'),
            COALESCE(p_app_data->>'contact_language', 'Tamil'),
            COALESCE(p_app_data->'social_platforms', '["Instagram"]'::jsonb),
            COALESCE(p_app_data->>'instagram_url', ''),
            COALESCE(p_app_data->>'youtube_url', ''),
            COALESCE(p_app_data->'other_profile_urls', '[]'::jsonb),
            COALESCE(p_app_data->>'follower_count', ''),
            COALESCE(p_app_data->>'subscriber_count', ''),
            COALESCE(p_app_data->>'average_views', ''),
            COALESCE(p_app_data->>'publishing_frequency', ''),
            COALESCE(p_app_data->'creator_categories', '[]'::jsonb),
            COALESCE(p_app_data->'languages', '["Tamil"]'::jsonb),
            COALESCE(p_app_data->'dialects', '[]'::jsonb),
            COALESCE(p_app_data->>'creator_classification', 'ugc'),
            COALESCE(p_app_data->>'audience_location', ''),
            COALESCE(p_app_data->'audience_insights', '{}'::jsonb),
            COALESCE(p_app_data->'collaboration_preferences', '[]'::jsonb),
            COALESCE(p_app_data->'expected_rates', '{}'::jsonb),
            COALESCE(p_app_data->>'travel_availability', ''),
            COALESCE(p_app_data->'previous_collaborations', '{}'::jsonb),
            COALESCE(p_app_data->'portfolio_urls', '[]'::jsonb),
            COALESCE((p_app_data->>'privacy_consent')::boolean, true),
            COALESCE((p_app_data->>'contact_consent')::boolean, true),
            COALESCE((p_app_data->>'brand_sharing_consent')::boolean, true),
            'pending',     -- FORCED SERVER-CONTROLLED: status is strictly pending
            NULL,          -- FORCED SERVER-CONTROLLED: admin_notes is never accepted from public payload
            '[]'::jsonb,   -- FORCED SERVER-CONTROLLED: campaign_matches is server-controlled
            '[]'::jsonb,   -- FORCED SERVER-CONTROLLED: payments is server-controlled
            jsonb_build_array( -- FORCED SERVER-CONTROLLED: server audit event
                jsonb_build_object(
                    'id', 'act_' || floor(extract(epoch from now()) * 1000)::text,
                    'event_type', 'application_submitted',
                    'action', 'Application Submitted',
                    'actor_email', 'portal@unikorn360.com',
                    'timestamp', to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                    'details', 'Self-registered through UNIKORN360 Creator Portal.'
                )
            ),
            NULL,          -- FORCED SERVER-CONTROLLED: latest_score is server-controlled
            p_app_data->>'ip_hash'
        );
    END IF;

    -- 5. Bind application to upload session AFTER creator_applications record exists
    UPDATE public.creator_upload_sessions
    SET application_id = v_target_app_id,
        status = 'completed'
    WHERE id = p_session_id;

    -- 6. Validate and insert assets
    IF p_assets IS NOT NULL AND jsonb_array_length(p_assets) > 0 THEN
        FOR v_asset IN SELECT * FROM jsonb_array_elements(p_assets)
        LOOP
            v_storage_path := v_asset->>'storage_path';
            v_file_type := v_asset->>'file_type';
            v_file_size := (v_asset->>'file_size')::bigint;
            v_orig_filename := v_asset->>'original_filename';
            v_mime_type := v_asset->>'mime_type';

            IF v_storage_path IS NULL OR length(trim(v_storage_path)) = 0 THEN
                RAISE EXCEPTION 'MALFORMED_ASSET: Asset storage_path is missing.'
                    USING ERRCODE = 'P0001';
            END IF;

            -- 6a. Every submitted asset must belong to this session
            v_session_asset_obj := NULL;
            SELECT COALESCE(elem->1, elem) INTO v_session_asset_obj
            FROM jsonb_array_elements(v_session.assets) AS elem
            WHERE elem->>0 = v_storage_path
               OR elem->>'storage_path' = v_storage_path
               OR elem->>'storagePath' = v_storage_path
               OR (elem->1)->>'storagePath' = v_storage_path
               OR (elem->1)->>'storage_path' = v_storage_path
            LIMIT 1;

            IF v_session_asset_obj IS NULL THEN
                RAISE EXCEPTION 'FOREIGN_ASSET_PATH: Asset storagePath "%" does not belong to this upload session.', v_storage_path
                    USING ERRCODE = 'P0001';
            END IF;

            -- 6b. Verify registered category matches submitted category
            v_reg_category := COALESCE(v_session_asset_obj->>'category', v_session_asset_obj->>'file_type');
            IF v_reg_category IS NOT NULL AND v_reg_category != v_file_type THEN
                RAISE EXCEPTION 'CATEGORY_MISMATCH: Submitted category "%" does not match registered category "%" for asset "%".', v_file_type, v_reg_category, v_storage_path
                    USING ERRCODE = 'P0001';
            END IF;

            -- 6c. Validate category and file size limits
            IF v_file_type NOT IN ('video_sample', 'audience_insight', 'media_kit') THEN
                RAISE EXCEPTION 'INVALID_ASSET_CATEGORY: Category "%" is not supported.', v_file_type
                    USING ERRCODE = 'P0001';
            END IF;

            IF v_file_size <= 0 THEN
                RAISE EXCEPTION 'MALFORMED_FILE: Asset "%" byte size must be greater than zero.', v_storage_path
                    USING ERRCODE = 'P0001';
            END IF;

            IF v_file_type = 'video_sample' AND v_file_size > 31457280 THEN
                RAISE EXCEPTION 'FILE_TOO_LARGE: Video sample "%" exceeds 30 MB limit (% bytes).', v_storage_path, v_file_size
                    USING ERRCODE = 'P0001';
            END IF;

            IF v_file_type = 'audience_insight' AND v_file_size > 5242880 THEN
                RAISE EXCEPTION 'FILE_TOO_LARGE: Audience insight "%" exceeds 5 MB limit (% bytes).', v_storage_path, v_file_size
                    USING ERRCODE = 'P0001';
            END IF;

            IF v_file_type = 'media_kit' AND v_file_size > 10485760 THEN
                RAISE EXCEPTION 'FILE_TOO_LARGE: Media kit "%" exceeds 10 MB limit (% bytes).', v_storage_path, v_file_size
                    USING ERRCODE = 'P0001';
            END IF;

            -- 6d. Reject paths already owned by another application
            SELECT application_id INTO v_existing_asset_app_id
            FROM public.creator_assets
            WHERE storage_path = v_storage_path;

            IF FOUND AND v_existing_asset_app_id != v_target_app_id THEN
                RAISE EXCEPTION 'FOREIGN_ASSET_PATH: Asset storage path "%" is already owned by application "%". Reassigning ownership is prohibited.', v_storage_path, v_existing_asset_app_id
                    USING ERRCODE = 'P0001';
            END IF;

            -- 6e. Insert asset: never update application_id on conflict
            INSERT INTO public.creator_assets (
                application_id,
                file_type,
                original_filename,
                storage_path,
                mime_type,
                file_size
            ) VALUES (
                v_target_app_id,
                v_file_type,
                v_orig_filename,
                v_storage_path,
                v_mime_type,
                v_file_size
            )
            ON CONFLICT (storage_path) DO UPDATE SET
                file_type = EXCLUDED.file_type,
                original_filename = EXCLUDED.original_filename,
                mime_type = EXCLUDED.mime_type,
                file_size = EXCLUDED.file_size
            WHERE creator_assets.application_id = v_target_app_id;
        END LOOP;
    END IF;

    -- 7. Return success result
    RETURN jsonb_build_object(
        'success', true,
        'id', v_target_app_id,
        'reference_number', v_ref,
        'message', 'Application recorded into UNIKORN360 Creator Network pipeline.'
    );
END;
$$;

-- Revoke EXECUTE from PUBLIC, anon, and authenticated
REVOKE ALL ON FUNCTION public.submit_creator_application(VARCHAR, VARCHAR, UUID, JSONB, JSONB) FROM PUBLIC, anon, authenticated;

-- Grant EXECUTE exclusively to service_role
GRANT EXECUTE ON FUNCTION public.submit_creator_application(VARCHAR, VARCHAR, UUID, JSONB, JSONB) TO service_role;
