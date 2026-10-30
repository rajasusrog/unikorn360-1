-- Migration 20261107: Protect Creator Upload Session State & Transitions
-- 1. Prevent completed sessions from reverting to created, registered, or verified
-- 2. Prevent clearing or overwriting an existing application_id
-- 3. Merge assets on update so newly added assets or verified assets are never dropped

CREATE OR REPLACE FUNCTION public.protect_creator_upload_session_state()
RETURNS TRIGGER AS $$
DECLARE
    v_old_elem jsonb;
    v_new_elem jsonb;
    v_path text;
    v_found boolean;
BEGIN
    -- 1. Disallow downgrading completed status
    IF OLD.status = 'completed' AND NEW.status IN ('created', 'registered', 'verified') THEN
        NEW.status := 'completed';
    END IF;

    -- 2. Never clear or reassign an existing application_id
    IF OLD.application_id IS NOT NULL AND (NEW.application_id IS NULL OR NEW.application_id != OLD.application_id) THEN
        NEW.application_id := OLD.application_id;
    END IF;

    -- 3. Merge assets so older verified/uploaded assets and newer registrations are both kept
    IF OLD.assets IS NOT NULL AND jsonb_typeof(OLD.assets) = 'array' AND jsonb_array_length(OLD.assets) > 0 THEN
        IF NEW.assets IS NULL OR jsonb_typeof(NEW.assets) != 'array' OR jsonb_array_length(NEW.assets) = 0 THEN
            NEW.assets := OLD.assets;
        ELSE
            -- Start with NEW.assets, add any OLD.assets not in NEW, and preserve verified/consumed flags
            FOR v_old_elem IN SELECT * FROM jsonb_array_elements(OLD.assets)
            LOOP
                v_path := v_old_elem->>0;
                v_found := false;
                FOR v_new_elem IN SELECT * FROM jsonb_array_elements(NEW.assets)
                LOOP
                    IF v_new_elem->>0 = v_path THEN
                        v_found := true;
                        EXIT;
                    END IF;
                END LOOP;
                IF NOT v_found THEN
                    NEW.assets := NEW.assets || jsonb_build_array(v_old_elem);
                END IF;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_creator_upload_session ON public.creator_upload_sessions;
CREATE TRIGGER trg_protect_creator_upload_session
    BEFORE UPDATE ON public.creator_upload_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_creator_upload_session_state();
