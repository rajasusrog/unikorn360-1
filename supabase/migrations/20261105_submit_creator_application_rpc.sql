-- Migration 20261105: Transactional RPC for Creator Application Submission with Session Binding
-- Resolves foreign key timing blocker by creating creator_applications BEFORE updating creator_upload_sessions.

CREATE OR REPLACE FUNCTION submit_creator_application(
    p_session_id VARCHAR(128),
    p_submission_secret VARCHAR(128),
    p_app_id UUID,
    p_app_data JSONB,
    p_assets JSONB DEFAULT '[]'::jsonb,
    p_simulate_asset_error BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_existing RECORD;
    v_email TEXT;
    v_whatsapp TEXT;
    v_target_app_id UUID := p_app_id;
    v_ref TEXT;
    v_asset JSONB;
BEGIN
    -- 1. Validate session parameters and Lock session row
    IF p_session_id IS NULL OR length(p_session_id) = 0 THEN
        RAISE EXCEPTION 'MISSING_UPLOAD_SESSION: uploadSessionId is required.'
            USING ERRCODE = 'P0001';
    END IF;

    SELECT * INTO v_session
    FROM creator_upload_sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'EXPIRED_SESSION: Upload session does not exist or has expired.'
            USING ERRCODE = 'P0001';
    END IF;

    IF p_submission_secret IS NULL OR v_session.submission_secret != p_submission_secret THEN
        RAISE EXCEPTION 'INVALID_SUBMISSION_SECRET: submissionSecret is missing or invalid for this session.'
            USING ERRCODE = 'P0001';
    END IF;

    -- 2. Check for completed submission on this exact session
    IF v_session.status = 'completed' AND v_session.application_id IS NOT NULL THEN
        SELECT id, application_reference INTO v_existing
        FROM creator_applications
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

    -- Extract email and whatsapp phone for duplicate check
    v_email := lower(trim(p_app_data->>'email'));
    v_whatsapp := regexp_replace(p_app_data->>'whatsapp_number', '[\s-]+', '', 'g');

    -- Check for existing non-rejected application with matching email or whatsapp
    SELECT id, application_reference INTO v_existing
    FROM creator_applications
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
        -- 3. Insert application using one consistent application UUID BEFORE updating session or assets
        v_ref := p_app_data->>'application_reference';

        INSERT INTO creator_applications (
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
            activity_log,
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
            COALESCE(p_app_data->>'application_status', 'pending'),
            COALESCE(p_app_data->>'admin_notes', ''),
            COALESCE(p_app_data->'activity_log', '[]'::jsonb),
            p_app_data->>'ip_hash'
        );
    END IF;

    -- 4. Bind application to upload session AFTER creator_applications record exists
    UPDATE creator_upload_sessions
    SET application_id = v_target_app_id,
        status = 'completed'
    WHERE id = p_session_id;

    -- 5. Record verified asset metadata (or simulate asset recording failure for tests)
    IF jsonb_array_length(p_assets) > 0 OR p_simulate_asset_error THEN
        IF p_simulate_asset_error THEN
            RAISE EXCEPTION 'ASSET_RECORDING_FAILED: Simulated asset metadata insert error.'
                USING ERRCODE = 'P0001';
        END IF;

        FOR v_asset IN SELECT * FROM jsonb_array_elements(p_assets)
        LOOP
            INSERT INTO creator_assets (
                application_id,
                file_type,
                original_filename,
                storage_path,
                mime_type,
                file_size
            ) VALUES (
                v_target_app_id,
                v_asset->>'file_type',
                v_asset->>'original_filename',
                v_asset->>'storage_path',
                v_asset->>'mime_type',
                (v_asset->>'file_size')::bigint
            )
            ON CONFLICT (storage_path) DO UPDATE SET
                application_id = EXCLUDED.application_id,
                file_type = EXCLUDED.file_type,
                original_filename = EXCLUDED.original_filename,
                mime_type = EXCLUDED.mime_type,
                file_size = EXCLUDED.file_size;
        END LOOP;
    END IF;

    -- 6. Return success result
    RETURN jsonb_build_object(
        'success', true,
        'id', v_target_app_id,
        'reference_number', v_ref,
        'message', 'Application recorded into UNIKORN360 Creator Network pipeline.'
    );
END;
$$;
