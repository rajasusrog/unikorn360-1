-- UNIKORN360 DYNAMIC SERVICES ARCHITECTURE
-- Version-controlled schema migration

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SERVICE DIVISIONS TABLE
CREATE TABLE IF NOT EXISTS service_divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookup and ordering
CREATE INDEX IF NOT EXISTS idx_service_divisions_slug ON service_divisions(slug);
CREATE INDEX IF NOT EXISTS idx_service_divisions_status_order ON service_divisions(status, display_order);

-- 2. SERVICE CATALOG TABLE
CREATE TABLE IF NOT EXISTS service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID NOT NULL REFERENCES service_divisions(id) ON DELETE RESTRICT,
    service_name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT,
    problems_solved JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_customers JSONB NOT NULL DEFAULT '[]'::jsonb,
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    packages JSONB NOT NULL DEFAULT '[]'::jsonb,
    process_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    additional_charges JSONB NOT NULL DEFAULT '[]'::jsonb,
    hero_image_url TEXT,
    hero_image_alt VARCHAR(255),
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    seo_title VARCHAR(255),
    seo_description TEXT,
    social_image_url TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    display_order INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_division_service_slug UNIQUE (division_id, slug)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_catalog_division_id ON service_catalog(division_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_slug ON service_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_service_catalog_status ON service_catalog(status);
CREATE INDEX IF NOT EXISTS idx_service_catalog_display_order ON service_catalog(display_order);

-- 3. SERVICE RELATIONS TABLE (Bidirectional / Directed Graph)
CREATE TABLE IF NOT EXISTS service_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    related_service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL DEFAULT 'recommended' CHECK (relation_type IN ('prerequisite', 'recommended', 'bundle', 'next_step')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_no_self_relation CHECK (service_id <> related_service_id),
    CONSTRAINT uq_service_relation UNIQUE (service_id, related_service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_relations_service_id ON service_relations(service_id);
CREATE INDEX IF NOT EXISTS idx_service_relations_related_id ON service_relations(related_service_id);

-- 4. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_divisions_updated_at ON service_divisions;
CREATE TRIGGER trg_service_divisions_updated_at
    BEFORE UPDATE ON service_divisions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_service_catalog_updated_at ON service_catalog;
CREATE TRIGGER trg_service_catalog_updated_at
    BEFORE UPDATE ON service_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE service_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_relations ENABLE ROW LEVEL SECURITY;

-- Anonymous / Public users: Can read only published divisions
DROP POLICY IF EXISTS "Public can view published divisions" ON service_divisions;
CREATE POLICY "Public can view published divisions"
    ON service_divisions
    FOR SELECT
    USING (status = 'published');

-- Anonymous / Public users: Can read only published services whose parent division is also published
DROP POLICY IF EXISTS "Public can view published services" ON service_catalog;
CREATE POLICY "Public can view published services"
    ON service_catalog
    FOR SELECT
    USING (
        status = 'published' AND
        division_id IN (
            SELECT id FROM service_divisions WHERE status = 'published'
        )
    );

-- Anonymous / Public users: Can read relations where both services are published
DROP POLICY IF EXISTS "Public can view active relations" ON service_relations;
CREATE POLICY "Public can view active relations"
    ON service_relations
    FOR SELECT
    USING (
        service_id IN (SELECT id FROM service_catalog WHERE status = 'published') AND
        related_service_id IN (SELECT id FROM service_catalog WHERE status = 'published')
    );

-- Authenticated Admin policies
DROP POLICY IF EXISTS "Admins have full access to divisions" ON service_divisions;
CREATE POLICY "Admins have full access to divisions"
    ON service_divisions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to catalog" ON service_catalog;
CREATE POLICY "Admins have full access to catalog"
    ON service_catalog
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to relations" ON service_relations;
CREATE POLICY "Admins have full access to relations"
    ON service_relations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
