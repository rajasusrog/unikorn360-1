import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

export interface DbTestScenarioResult {
  scenarioNumber: number;
  category:
    | 'Executed Database Tests (PGlite PG16 — Fresh Install)'
    | 'Executed Database Tests (PGlite PG16 — Upgrade Path)'
    | 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)';
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

/**
 * Deterministic migration order across all 7 migration files in /supabase/migrations.
 * Necessary because 4 baseline files share the 20261028_ prefix and have table dependencies:
 * - 20261028_services_architecture.sql creates service_divisions, service_catalog, service_relations
 * - 20261028_location_neutral_update.sql updates service_divisions and service_catalog
 * - 20261028_reorganize_services_6_divisions.sql upserts the 6 canonical divisions & 37 services
 * - 20261028_creator_network_tables.sql creates creator_applications, creator_assets, creator_admin_users, creator_evaluations
 * - 20261029_fix_admin_auth_and_rls.sql hardens RLS policies and creates initial evaluator RPC
 * - 20261030_fix_evaluator_rpc_and_activity_leak.sql adds initial activity_log filter RPC
 * - 20261031_strict_evaluator_projection_and_notes_privacy.sql enforces allowlisted fixed-summary projection & excludes admin_notes
 */
export const DETERMINISTIC_MIGRATION_ORDER = [
  '20261028_services_architecture.sql',
  '20261028_location_neutral_update.sql',
  '20261028_reorganize_services_6_divisions.sql',
  '20261028_creator_network_tables.sql',
  '20261029_fix_admin_auth_and_rls.sql',
  '20261030_fix_evaluator_rpc_and_activity_leak.sql',
  '20261031_strict_evaluator_projection_and_notes_privacy.sql'
] as const;

export const TEST_DB_USERS = {
  superadmin: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'superadmin.test@unikorn360.internal',
    role: 'superadmin' as const
  },
  admin: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'admin.test@unikorn360.internal',
    role: 'admin' as const
  },
  evaluator: {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'evaluator.test@unikorn360.internal',
    role: 'evaluator' as const
  },
  ordinaryUser: {
    id: '44444444-4444-4444-8444-444444444444',
    email: 'ordinary.test@external.internal',
    role: null
  },
  removableEvaluator: {
    id: '55555555-5555-4555-8555-555555555555',
    email: 'temp.evaluator@unikorn360.internal',
    role: 'evaluator' as const
  }
};

export const PRIVACY_FIXTURE_CONSTANTS = {
  creatorId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  creatorRef: 'U360-CR-TEST-001',
  secretAmount: 98765,
  secretFormattedAmount: '98,765',
  secretUtr: 'ABC123XYZ',
  secretPaymentNote: 'CONFIDENTIAL_PAY_NOTE_XYZ',
  secretAdminNote: 'INTERNAL ADMIN NOTE: Paid 98765 via ABC123XYZ — CONFIDENTIAL_PAY_NOTE_XYZ',
  secretActorEmail: 'finance.secret@unikorn360.internal',
  secretIpHash: 'sha256_secret_ip_hash_998877665544332211'
};

/**
 * Bootstraps Supabase-compatible auth and storage schemas and roles (anon, authenticated)
 * in a disposable in-process PGlite PostgreSQL 16 database instance.
 */
async function bootstrapSupabaseCompatiblePostgres(): Promise<PGlite> {
  const db = new PGlite({
    extensions: { pgcrypto }
  });

  await db.exec(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
      END IF;
    END $$;

    GRANT USAGE ON SCHEMA public TO anon, authenticated;

    CREATE SCHEMA IF NOT EXISTS auth;
    GRANT USAGE ON SCHEMA auth TO PUBLIC, anon, authenticated;

    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS UUID
    LANGUAGE sql
    STABLE
    AS $fn$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $fn$;

    CREATE OR REPLACE FUNCTION auth.role()
    RETURNS TEXT
    LANGUAGE sql
    STABLE
    AS $fn$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), current_user::text);
    $fn$;

    GRANT EXECUTE ON FUNCTION auth.uid() TO PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION auth.role() TO PUBLIC, anon, authenticated;

    CREATE SCHEMA IF NOT EXISTS storage;
    GRANT USAGE ON SCHEMA storage TO PUBLIC, anon, authenticated;

    CREATE TABLE IF NOT EXISTS storage.buckets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      public BOOLEAN NOT NULL DEFAULT false,
      file_size_limit BIGINT,
      allowed_mime_types TEXT[]
    );

    CREATE TABLE IF NOT EXISTS storage.objects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id TEXT REFERENCES storage.buckets(id),
      name TEXT,
      owner UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  `);

  return db;
}

async function grantSupabaseTablePrivileges(db: PGlite): Promise<void> {
  await db.exec(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage TO anon, authenticated;
  `);
}

/**
 * Builds the 10 required activity_log & creator record fixtures for testing SQL and API privacy.
 */
export function buildAllTenActivityLogFixtures() {
  return [
    // Fixture 1: Direct payment_recorded event
    {
      id: 'act_01_payment',
      event_type: 'payment_recorded',
      action: `Payment Recorded: ₹${PRIVACY_FIXTURE_CONSTANTS.secretFormattedAmount}`,
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T09:00:00Z',
      details: `Amount: ${PRIVACY_FIXTURE_CONSTANTS.secretAmount} | UTR: ${PRIVACY_FIXTURE_CONSTANTS.secretUtr} | Notes: ${PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote}`
    },
    // Fixture 2: Allowed status_updated event whose details contain bare payment amount and transaction reference (no financial keywords)
    {
      id: 'act_02_status_bare_leak',
      event_type: 'status_updated',
      action: 'Status changed',
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T10:00:00Z',
      details: `${PRIVACY_FIXTURE_CONSTANTS.secretAmount} | ${PRIVACY_FIXTURE_CONSTANTS.secretUtr}`
    },
    // Fixture 3: Allowed campaigns_updated event whose action/details contain payment notes
    {
      id: 'act_03_campaigns_note_leak',
      event_type: 'campaigns_updated',
      action: `Campaigns updated (${PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote})`,
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T11:00:00Z',
      details: `Assigned Q4 Campaign — ${PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote}`
    },
    // Fixture 4: Allowed evaluation_submitted event containing nested payment metadata
    {
      id: 'act_04_eval_nested_leak',
      event_type: 'evaluation_submitted',
      action: 'Score 88/100 submitted',
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T12:00:00Z',
      details: 'Evaluated creator rubric',
      nested_metadata: {
        amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount,
        reference_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr,
        notes: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote
      }
    },
    // Fixture 5: Legacy unstructured event without event_type
    {
      id: 'act_05_legacy_no_type',
      action: `Legacy manual note: ${PRIVACY_FIXTURE_CONSTANTS.secretAmount} | ${PRIVACY_FIXTURE_CONSTANTS.secretUtr}`,
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T13:00:00Z',
      details: 'Unstructured historical entry without event_type'
    },
    // Fixture 6: Unknown event_type
    {
      id: 'act_06_unknown_type',
      event_type: 'custom_internal_audit',
      action: `Internal audit ${PRIVACY_FIXTURE_CONSTANTS.secretUtr}`,
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T14:00:00Z',
      details: `Audit ref ${PRIVACY_FIXTURE_CONSTANTS.secretAmount}`
    },
    // Fixture 8a: Malformed identifier containing sensitive string / invalid characters
    {
      id: `bad id ${PRIVACY_FIXTURE_CONSTANTS.secretAmount} ${PRIVACY_FIXTURE_CONSTANTS.secretUtr}`,
      event_type: 'status_updated',
      action: 'Status changed',
      timestamp: '2026-10-28T15:00:00Z',
      details: 'Should be rejected due to invalid id'
    },
    // Fixture 8b: Malformed timestamp containing sensitive string
    {
      id: 'act_08_bad_ts_string',
      event_type: 'status_updated',
      action: 'Status changed',
      timestamp: `not-a-timestamp-${PRIVACY_FIXTURE_CONSTANTS.secretAmount}-${PRIVACY_FIXTURE_CONSTANTS.secretUtr}`,
      details: 'Should be rejected due to invalid timestamp'
    },
    // Fixture 8c: Impossible calendar timestamp matching digits
    {
      id: 'act_08_impossible_calendar_ts',
      event_type: 'status_updated',
      action: 'Status changed',
      timestamp: '2026-02-30T25:99:99Z',
      details: 'Should be rejected due to impossible calendar date'
    },
    // Fixture 9: Valid application_submitted event (alongside valid events 2, 3, 4 to verify exact order preservation)
    {
      id: 'act_09_app_submitted',
      event_type: 'application_submitted',
      action: `Application submitted by creator (${PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote})`,
      actor_email: PRIVACY_FIXTURE_CONSTANTS.secretActorEmail,
      timestamp: '2026-10-28T16:00:00.123Z',
      details: `Initial submission details ${PRIVACY_FIXTURE_CONSTANTS.secretAmount}`
    }
  ];
}

async function seedSyntheticUsersAndData(db: PGlite): Promise<void> {
  // 1. Seed synthetic users into auth.users
  for (const u of Object.values(TEST_DB_USERS)) {
    await db.query(
      `INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.email]
    );
  }

  // 2. Seed administrator memberships into public.creator_admin_users (ordinaryUser is intentionally excluded)
  for (const u of [
    TEST_DB_USERS.superadmin,
    TEST_DB_USERS.admin,
    TEST_DB_USERS.evaluator,
    TEST_DB_USERS.removableEvaluator
  ]) {
    await db.query(
      `INSERT INTO public.creator_admin_users (authenticated_user_id, email, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (authenticated_user_id) DO UPDATE SET role = EXCLUDED.role`,
      [u.id, u.email, u.role]
    );
  }

  // 3. Seed synthetic creator application with all 10 fixtures, payments, admin_notes, and ip_hash
  const activityFixtures = buildAllTenActivityLogFixtures();
  const paymentsFixture = [
    {
      id: 'pay_fixture_01',
      campaign_name: 'Private Brand Launch',
      amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount,
      status: 'paid',
      payment_date: '2026-10-28',
      reference_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr,
      notes: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote
    }
  ];

  await db.query(
    `INSERT INTO public.creator_applications (
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
      follower_count,
      average_views,
      creator_categories,
      languages,
      dialects,
      creator_classification,
      collaboration_preferences,
      expected_rates,
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
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10::jsonb, $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb,
      $17, $18::jsonb, $19::jsonb, $20::jsonb,
      true, true, true,
      'shortlisted',
      $21,
      $22::jsonb,
      $23::jsonb,
      $24::jsonb,
      88.50,
      $25
    ) ON CONFLICT (id) DO UPDATE SET
      admin_notes = EXCLUDED.admin_notes,
      payments = EXCLUDED.payments,
      activity_log = EXCLUDED.activity_log,
      ip_hash = EXCLUDED.ip_hash`,
    [
      PRIVACY_FIXTURE_CONSTANTS.creatorId,
      PRIVACY_FIXTURE_CONSTANTS.creatorRef,
      'Synthetic Test Creator',
      '9444000001',
      'creator.fixture@example.com',
      'Tamil Nadu',
      'Chennai',
      'Adyar',
      'Tamil',
      JSON.stringify(['Instagram']),
      'https://instagram.com/synthetic_creator',
      '25K',
      '12K',
      JSON.stringify(['Technology & Gadgets']),
      JSON.stringify(['Tamil', 'English']),
      JSON.stringify(['Chennai Tamil / Madras Bashai']),
      'l3_micro',
      JSON.stringify(['Sponsored Reel / Short']),
      JSON.stringify({ ugc: '2500', sponsoredReel: '5000' }),
      JSON.stringify(['https://instagram.com/reel/1', 'https://instagram.com/reel/2']),
      PRIVACY_FIXTURE_CONSTANTS.secretAdminNote,
      JSON.stringify(['Q4 Tech Launch']),
      JSON.stringify(paymentsFixture),
      JSON.stringify(activityFixtures),
      PRIVACY_FIXTURE_CONSTANTS.secretIpHash
    ]
  );
}

/**
 * Helper to execute SQL statements inside a transaction impersonating a specific Postgres role and JWT subject UUID.
 */
async function runAsRole<T = any>(
  db: PGlite,
  pgRole: 'anon' | 'authenticated',
  userId: string | null,
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  await db.exec('BEGIN');
  try {
    await db.exec(`SET LOCAL ROLE ${pgRole}`);
    await db.exec(
      `SELECT set_config('request.jwt.claim.role', '${pgRole}', true),
              set_config('request.jwt.claim.sub', '${userId || ''}', true)`
    );
    const res = await db.query<T>(sql, params);
    await db.exec('COMMIT');
    return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

export async function runDatabaseVerificationSuite(startScenarioNumber: number): Promise<DbTestScenarioResult[]> {
  const results: DbTestScenarioResult[] = [];
  let nextScenario = startScenarioNumber;
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

  // =========================================================================
  // PART A: FRESH DATABASE INSTALLATION TEST (All 7 migrations from scratch)
  // =========================================================================
  const freshDb = await bootstrapSupabaseCompatiblePostgres();
  try {
    const appliedFiles: string[] = [];
    let freshInstallError: string | null = null;

    try {
      for (const filename of DETERMINISTIC_MIGRATION_ORDER) {
        const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
        await freshDb.exec(sql);
        appliedFiles.push(filename);
      }
      await grantSupabaseTablePrivileges(freshDb);
    } catch (err: any) {
      freshInstallError = err?.message || String(err);
    }

    // Verify expected tables, RLS enabled flags, and functions exist
    const tablesRes = await freshDb.query<{ tablename: string; rowsecurity: boolean }>(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN (
          'service_divisions',
          'service_catalog',
          'service_relations',
          'creator_applications',
          'creator_assets',
          'creator_admin_users',
          'creator_evaluations'
        )
      ORDER BY tablename
    `);

    const all7TablesHaveRls =
      tablesRes.rows.length === 7 && tablesRes.rows.every((r) => r.rowsecurity === true);

    results.push({
      scenarioNumber: nextScenario++,
      category: 'Executed Database Tests (PGlite PG16 — Fresh Install)',
      name: 'Fresh database installation applies all 7 migrations in deterministic order and enables RLS on all 7 public tables',
      passed: freshInstallError === null && appliedFiles.length === 7 && all7TablesHaveRls,
      expected: '7/7 migrations applied cleanly; 7/7 tables have rowsecurity=true',
      actual: freshInstallError
        ? `Failed at migration #${appliedFiles.length + 1}: ${freshInstallError}`
        : `${appliedFiles.length}/7 migrations applied (${appliedFiles.join(' -> ')}); RLS tables=${tablesRes.rows.length}/7`
    });

    // Seed synthetic data in Fresh DB and run the 12 required assertions + 10 fixtures
    await seedSyntheticUsersAndData(freshDb);

    // -----------------------------------------------------------------------
    // Assertion 1: Anonymous access to creator_applications and evaluator RPC fails
    // -----------------------------------------------------------------------
    {
      const anonSelect = await runAsRole(
        freshDb,
        'anon',
        null,
        `SELECT id FROM public.creator_applications`
      );

      let anonRpcBlocked = false;
      let anonRpcError = '';
      try {
        await runAsRole(
          freshDb,
          'anon',
          null,
          `SELECT * FROM public.get_creator_applications_for_evaluator()`
        );
      } catch (err: any) {
        anonRpcBlocked = true;
        anonRpcError = err?.message || String(err);
      }

      const passed = anonSelect.rows.length === 0 && anonRpcBlocked;
      results.push({
        scenarioNumber: nextScenario++,
        category: 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)',
        name: 'Assertion 1: Anonymous access to creator_applications (0 rows via RLS) and get_creator_applications_for_evaluator() (permission denied) fails',
        passed,
        expected: 'anon SELECT rows=0, anon RPC permission denied=true',
        actual: `anon SELECT rows=${anonSelect.rows.length}, anon RPC blocked=${anonRpcBlocked} (${anonRpcError})`
      });
    }

    // -----------------------------------------------------------------------
    // Assertion 2 & 3: Ordinary authenticated user cannot read creator_applications,
    // cannot call evaluator RPC, cannot read/insert/update/delete creator_admin_users
    // (no self-promotion), and cannot modify service_catalog
    // -----------------------------------------------------------------------
    {
      const ordId = TEST_DB_USERS.ordinaryUser.id;
      const ordApps = await runAsRole(
        freshDb,
        'authenticated',
        ordId,
        `SELECT id FROM public.creator_applications`
      );

      let ordRpcDenied = false;
      let ordRpcMsg = '';
      try {
        await runAsRole(
          freshDb,
          'authenticated',
          ordId,
          `SELECT * FROM public.get_creator_applications_for_evaluator()`
        );
      } catch (err: any) {
        ordRpcDenied = true;
        ordRpcMsg = err?.message || String(err);
      }

      const ordReadAdmins = await runAsRole(
        freshDb,
        'authenticated',
        ordId,
        `SELECT id FROM public.creator_admin_users`
      );

      let selfPromotionBlocked = false;
      try {
        await runAsRole(
          freshDb,
          'authenticated',
          ordId,
          `INSERT INTO public.creator_admin_users (authenticated_user_id, email, role)
           VALUES ($1, $2, 'superadmin')`,
          [ordId, TEST_DB_USERS.ordinaryUser.email]
        );
      } catch {
        selfPromotionBlocked = true;
      }

      const ordUpdateCatalog = await runAsRole(
        freshDb,
        'authenticated',
        ordId,
        `UPDATE public.service_divisions SET name = 'Hacked' WHERE slug = 'websites-software' RETURNING id`
      );

      let ordInsertCatalogBlocked = false;
      try {
        await runAsRole(
          freshDb,
          'authenticated',
          ordId,
          `INSERT INTO public.service_divisions (name, slug, short_description, status)
           VALUES ('Unauthorized Div', 'unauth-div', 'desc', 'published')`
        );
      } catch {
        ordInsertCatalogBlocked = true;
      }

      const passed =
        ordApps.rows.length === 0 &&
        ordRpcDenied &&
        ordRpcMsg.includes('Access denied: Administrator membership required') &&
        ordReadAdmins.rows.length === 0 &&
        selfPromotionBlocked &&
        ordUpdateCatalog.rows.length === 0 &&
        ordInsertCatalogBlocked;

      results.push({
        scenarioNumber: nextScenario++,
        category: 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)',
        name: 'Assertions 2 & 3: Ordinary authenticated user blocked from creator_applications, evaluator RPC, creator_admin_users read/self-promotion, and service_catalog writes',
        passed,
        expected: 'apps=0, rpcDenied=true, adminsRead=0, selfPromoBlocked=true, catalogWritesBlocked=true',
        actual: `apps=${ordApps.rows.length}, rpcDenied=${ordRpcDenied}, adminsRead=${ordReadAdmins.rows.length}, selfPromoBlocked=${selfPromotionBlocked}, catalogUpdateRows=${ordUpdateCatalog.rows.length}, catalogInsertBlocked=${ordInsertCatalogBlocked}`
      });
    }

    // -----------------------------------------------------------------------
    // Assertions 4, 5, 6, 7, 8 + All 10 Activity Log Fixtures (Evaluator SQL Privacy)
    // -----------------------------------------------------------------------
    {
      const evalId = TEST_DB_USERS.evaluator.id;

      // Assertion 4: Evaluator cannot directly read creator_applications table
      const directTableRead = await runAsRole(
        freshDb,
        'authenticated',
        evalId,
        `SELECT * FROM public.creator_applications`
      );

      // Assertion 5: Evaluator CAN call get_creator_applications_for_evaluator()
      const rpcRes = await runAsRole<Record<string, any>>(
        freshDb,
        'authenticated',
        evalId,
        `SELECT * FROM public.get_creator_applications_for_evaluator() WHERE id = $1`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId]
      );

      const row = rpcRes.rows[0];
      const serializedRow = JSON.stringify(row || {});
      const serializedActivityLog = JSON.stringify(row?.activity_log || []);

      // Assertion 6: Exclude payments, ip_hash, and admin_notes from SQL RPC output
      const excludesSensitiveColumns =
        Boolean(row) &&
        !('payments' in row) &&
        !('ip_hash' in row) &&
        !('admin_notes' in row);

      // Assertion 7: Never contains 98765, 98,765, ABC123XYZ, payment notes, admin notes, actor emails, or free-text details
      const hasNoLeakedTokens =
        !serializedRow.includes(String(PRIVACY_FIXTURE_CONSTANTS.secretAmount)) &&
        !serializedRow.includes(PRIVACY_FIXTURE_CONSTANTS.secretFormattedAmount) &&
        !serializedRow.includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
        !serializedRow.includes(PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote) &&
        !serializedRow.includes(PRIVACY_FIXTURE_CONSTANTS.secretAdminNote) &&
        !serializedRow.includes(PRIVACY_FIXTURE_CONSTANTS.secretActorEmail) &&
        !serializedRow.includes(PRIVACY_FIXTURE_CONSTANTS.secretIpHash) &&
        !serializedActivityLog.includes('"details"') &&
        !serializedActivityLog.includes('"actor_email"');

      // Assertion 8: Preserves allowed events in exact order with fixed summary text
      const evalActivityLog: Array<Record<string, any>> = row?.activity_log || [];
      const expectedOrderedSummaries = [
        {
          id: 'act_02_status_bare_leak',
          event_type: 'status_updated',
          action: 'Application status updated',
          timestamp: '2026-10-28T10:00:00Z'
        },
        {
          id: 'act_03_campaigns_note_leak',
          event_type: 'campaigns_updated',
          action: 'Campaign assignments updated',
          timestamp: '2026-10-28T11:00:00Z'
        },
        {
          id: 'act_04_eval_nested_leak',
          event_type: 'evaluation_submitted',
          action: 'Creator evaluation submitted',
          timestamp: '2026-10-28T12:00:00Z'
        },
        {
          id: 'act_09_app_submitted',
          event_type: 'application_submitted',
          action: 'Application submitted',
          timestamp: '2026-10-28T16:00:00.123Z'
        }
      ];

      const exactOrderAndShapeMatch =
        evalActivityLog.length === expectedOrderedSummaries.length &&
        evalActivityLog.every((item, idx) => {
          const exp = expectedOrderedSummaries[idx];
          return (
            Object.keys(item).sort().join(',') === 'action,event_type,id,timestamp' &&
            item.id === exp.id &&
            item.event_type === exp.event_type &&
            item.action === exp.action &&
            item.timestamp === exp.timestamp
          );
        });

      // Fixture 7: Malformed activity_log values (null, non-array object, array with non-object elements)
      const malformedRes = await runAsRole<{
        null_log: any;
        obj_log: any;
        scalar_elems_log: any;
      }>(
        freshDb,
        'authenticated',
        evalId,
        `SELECT
           public.filter_activity_log_for_evaluator(NULL) AS null_log,
           public.filter_activity_log_for_evaluator('{"unexpected":"object"}'::jsonb) AS obj_log,
           public.filter_activity_log_for_evaluator('["raw_string", 98765, null, true, ["nested_arr"]]'::jsonb) AS scalar_elems_log`
      );
      const malformedRow = malformedRes.rows[0];
      const malformedHandledSafely =
        Array.isArray(malformedRow?.null_log) &&
        malformedRow.null_log.length === 0 &&
        Array.isArray(malformedRow?.obj_log) &&
        malformedRow.obj_log.length === 0 &&
        Array.isArray(malformedRow?.scalar_elems_log) &&
        malformedRow.scalar_elems_log.length === 0;

      const passed =
        directTableRead.rows.length === 0 &&
        rpcRes.rows.length === 1 &&
        excludesSensitiveColumns &&
        hasNoLeakedTokens &&
        exactOrderAndShapeMatch &&
        malformedHandledSafely;

      results.push({
        scenarioNumber: nextScenario++,
        category: 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)',
        name: 'Assertions 4–8 & All 10 Fixtures: Evaluator blocked from direct table SELECT, allowed via RPC, excludes payments/ip_hash/admin_notes, blocks bare amount/UTR/notes/legacy/unknown/malformed entries, and preserves exact order with fixed summaries',
        passed,
        expected: 'directSelect=0, rpcRows=1, excludesCols=true, noLeaks=true, exactSummariesOrder=true, malformedSafe=true',
        actual: `directSelect=${directTableRead.rows.length}, rpcRows=${rpcRes.rows.length}, excludesCols=${excludesSensitiveColumns}, noLeaks=${hasNoLeakedTokens}, exactSummariesOrder=${exactOrderAndShapeMatch}, malformedSafe=${malformedHandledSafely}`
      });
    }

    // -----------------------------------------------------------------------
    // Assertion 9: Evaluator CAN insert creator_evaluations, CANNOT update/delete
    // creator_evaluations, and CANNOT modify creator_applications or service_catalog
    // -----------------------------------------------------------------------
    {
      const evalId = TEST_DB_USERS.evaluator.id;
      const insertedEval = await runAsRole<{ id: string }>(
        freshDb,
        'authenticated',
        evalId,
        `INSERT INTO public.creator_evaluations (
           application_id, engagement_quality, average_views_score, content_quality,
           authenticity, presentation, audience_brand_fit, local_relevance,
           historical_performance, cost_efficiency, reliability, total_score,
           evaluation_notes, evaluated_by, evaluated_by_name
         ) VALUES ($1, 14, 9, 9, 9, 9, 14, 9, 9, 4, 5, 91, 'Evaluator SQL test', $2, 'Evaluator')
         RETURNING id`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId, evalId]
      );
      const evalRowId = insertedEval.rows[0]?.id;

      const evalUpdateEval = await runAsRole(
        freshDb,
        'authenticated',
        evalId,
        `UPDATE public.creator_evaluations SET total_score = 100 WHERE id = $1 RETURNING id`,
        [evalRowId]
      );

      const evalDeleteEval = await runAsRole(
        freshDb,
        'authenticated',
        evalId,
        `DELETE FROM public.creator_evaluations WHERE id = $1 RETURNING id`,
        [evalRowId]
      );

      const evalUpdateApp = await runAsRole(
        freshDb,
        'authenticated',
        evalId,
        `UPDATE public.creator_applications SET application_status = 'approved' WHERE id = $1 RETURNING id`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId]
      );

      const evalUpdateCatalog = await runAsRole(
        freshDb,
        'authenticated',
        evalId,
        `UPDATE public.service_divisions SET name = 'Evaluator Edit' WHERE slug = 'websites-software' RETURNING id`
      );

      const passed =
        Boolean(evalRowId) &&
        evalUpdateEval.rows.length === 0 &&
        evalDeleteEval.rows.length === 0 &&
        evalUpdateApp.rows.length === 0 &&
        evalUpdateCatalog.rows.length === 0;

      results.push({
        scenarioNumber: nextScenario++,
        category: 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)',
        name: 'Assertion 9: Evaluator can INSERT creator_evaluations, cannot UPDATE/DELETE creator_evaluations, and cannot modify creator_applications or service_catalog',
        passed,
        expected: 'insertEval=1, updateEval=0, deleteEval=0, updateApp=0, updateCatalog=0',
        actual: `insertEval=${insertedEval.rows.length}, updateEval=${evalUpdateEval.rows.length}, deleteEval=${evalDeleteEval.rows.length}, updateApp=${evalUpdateApp.rows.length}, updateCatalog=${evalUpdateCatalog.rows.length}`
      });
    }

    // -----------------------------------------------------------------------
    // Assertion 10: Admin CAN read/update creator_applications and service_catalog,
    // CANNOT delete creator_applications, and CANNOT modify creator_admin_users
    // -----------------------------------------------------------------------
    {
      const adminId = TEST_DB_USERS.admin.id;

      const adminReadApp = await runAsRole<{ id: string }>(
        freshDb,
        'authenticated',
        adminId,
        `SELECT id FROM public.creator_applications WHERE id = $1`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId]
      );

      const adminUpdateApp = await runAsRole<{ id: string }>(
        freshDb,
        'authenticated',
        adminId,
        `UPDATE public.creator_applications SET application_status = 'approved' WHERE id = $1 RETURNING id`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId]
      );

      const adminUpdateCatalog = await runAsRole<{ id: string }>(
        freshDb,
        'authenticated',
        adminId,
        `UPDATE public.service_divisions SET seo_title = 'Updated by Admin' WHERE slug = 'websites-software' RETURNING id`
      );

      const adminDeleteApp = await runAsRole<{ id: string }>(
        freshDb,
        'authenticated',
        adminId,
        `DELETE FROM public.creator_applications WHERE id = $1 RETURNING id`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId]
      );

      let adminInsertMemberBlocked = false;
      try {
        await runAsRole(
          freshDb,
          'authenticated',
          adminId,
          `INSERT INTO public.creator_admin_users (authenticated_user_id, email, role)
           VALUES ($1, 'promoted@unikorn360.internal', 'admin')`,
          [TEST_DB_USERS.ordinaryUser.id]
        );
      } catch {
        adminInsertMemberBlocked = true;
      }

      const adminPromoteSelfToSuper = await runAsRole(
        freshDb,
        'authenticated',
        adminId,
        `UPDATE public.creator_admin_users SET role = 'superadmin' WHERE authenticated_user_id = $1 RETURNING id`,
        [adminId]
      );

      const passed =
        adminReadApp.rows.length === 1 &&
        adminUpdateApp.rows.length === 1 &&
        adminUpdateCatalog.rows.length === 1 &&
        adminDeleteApp.rows.length === 0 &&
        adminInsertMemberBlocked &&
        adminPromoteSelfToSuper.rows.length === 0;

      results.push({
        scenarioNumber: nextScenario++,
        category: 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)',
        name: 'Assertion 10: Admin can SELECT/UPDATE creator_applications and service_catalog, cannot DELETE creator_applications, and cannot INSERT/UPDATE creator_admin_users',
        passed,
        expected: 'readApp=1, updateApp=1, updateCatalog=1, deleteApp=0, insertMemberBlocked=true, selfPromote=0',
        actual: `readApp=${adminReadApp.rows.length}, updateApp=${adminUpdateApp.rows.length}, updateCatalog=${adminUpdateCatalog.rows.length}, deleteApp=${adminDeleteApp.rows.length}, insertMemberBlocked=${adminInsertMemberBlocked}, selfPromote=${adminPromoteSelfToSuper.rows.length}`
      });
    }

    // -----------------------------------------------------------------------
    // Assertion 11 & 12: Superadmin full access (sees full payments, admin_notes,
    // and full 10-entry activity_log history) AND removing a user from
    // creator_admin_users immediately revokes SQL access
    // -----------------------------------------------------------------------
    {
      const superId = TEST_DB_USERS.superadmin.id;
      const removableId = TEST_DB_USERS.removableEvaluator.id;

      // Superadmin reads full creator_applications row including payments, admin_notes, and all 10 activity_log fixtures
      const superRead = await runAsRole<{
        id: string;
        admin_notes: string;
        payments: any[];
        activity_log: any[];
      }>(
        freshDb,
        'authenticated',
        superId,
        `SELECT id, admin_notes, payments, activity_log FROM public.creator_applications WHERE id = $1`,
        [PRIVACY_FIXTURE_CONSTANTS.creatorId]
      );

      const superRow = superRead.rows[0];
      const superSeesFullHistory =
        Boolean(superRow) &&
        superRow.admin_notes === PRIVACY_FIXTURE_CONSTANTS.secretAdminNote &&
        Array.isArray(superRow.payments) &&
        superRow.payments[0]?.amount === PRIVACY_FIXTURE_CONSTANTS.secretAmount &&
        superRow.payments[0]?.reference_utr === PRIVACY_FIXTURE_CONSTANTS.secretUtr &&
        Array.isArray(superRow.activity_log) &&
        superRow.activity_log.length === 10;

      // Before removal, removableEvaluator CAN call RPC
      const beforeRemovalRpc = await runAsRole(
        freshDb,
        'authenticated',
        removableId,
        `SELECT id FROM public.get_creator_applications_for_evaluator()`
      );

      // Superadmin removes removableEvaluator from creator_admin_users
      const superDeleteMember = await runAsRole(
        freshDb,
        'authenticated',
        superId,
        `DELETE FROM public.creator_admin_users WHERE authenticated_user_id = $1 RETURNING id`,
        [removableId]
      );

      // Immediately after removal, removableEvaluator is denied by RPC
      let afterRemovalDenied = false;
      try {
        await runAsRole(
          freshDb,
          'authenticated',
          removableId,
          `SELECT id FROM public.get_creator_applications_for_evaluator()`
        );
      } catch {
        afterRemovalDenied = true;
      }

      const passed =
        superSeesFullHistory &&
        beforeRemovalRpc.rows.length === 1 &&
        superDeleteMember.rows.length === 1 &&
        afterRemovalDenied;

      results.push({
        scenarioNumber: nextScenario++,
        category: 'Executed Database Tests (PGlite PG16 — RLS & RPC Matrix)',
        name: 'Assertions 11 & 12: Superadmin retains full unmutated payments, admin_notes, and 10-event activity_log; removing membership from creator_admin_users immediately revokes SQL RPC access',
        passed,
        expected: 'superFullHistory=true, beforeRemoval=1, deletedMember=1, afterRemovalDenied=true',
        actual: `superFullHistory=${superSeesFullHistory}, beforeRemoval=${beforeRemovalRpc.rows.length}, deletedMember=${superDeleteMember.rows.length}, afterRemovalDenied=${afterRemovalDenied}`
      });
    }
  } finally {
    await freshDb.close();
  }

  // =========================================================================
  // PART B: UPGRADE PATH TEST (Apply up to 20261030 -> Seed -> Apply 20261031)
  // =========================================================================
  const upgradeDb = await bootstrapSupabaseCompatiblePostgres();
  try {
    const pre2031Migrations = DETERMINISTIC_MIGRATION_ORDER.slice(0, 6);
    for (const filename of pre2031Migrations) {
      const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
      await upgradeDb.exec(sql);
    }
    await grantSupabaseTablePrivileges(upgradeDb);
    await seedSyntheticUsersAndData(upgradeDb);

    // Observe pre-upgrade 20261030 behavior:
    // Under 20261030, status_updated with bare "98765 | ABC123XYZ" and admin_notes were exposed!
    const preUpgradeRes = await runAsRole<Record<string, any>>(
      upgradeDb,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `SELECT * FROM public.get_creator_applications_for_evaluator() WHERE id = $1`,
      [PRIVACY_FIXTURE_CONSTANTS.creatorId]
    );
    const preSerialized = JSON.stringify(preUpgradeRes.rows[0] || {});
    const preUpgradeHadLeak =
      preSerialized.includes(String(PRIVACY_FIXTURE_CONSTANTS.secretAmount)) &&
      preSerialized.includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
      'admin_notes' in (preUpgradeRes.rows[0] || {});

    // Now apply the new migration 20261031_strict_evaluator_projection_and_notes_privacy.sql on top of 20261030
    const mig2031Sql = fs.readFileSync(
      path.join(migrationsDir, '20261031_strict_evaluator_projection_and_notes_privacy.sql'),
      'utf8'
    );
    await upgradeDb.exec(mig2031Sql);

    // Verify post-upgrade 20261031 behavior on the existing seeded database
    const postUpgradeRes = await runAsRole<Record<string, any>>(
      upgradeDb,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `SELECT * FROM public.get_creator_applications_for_evaluator() WHERE id = $1`,
      [PRIVACY_FIXTURE_CONSTANTS.creatorId]
    );
    const postRow = postUpgradeRes.rows[0];
    const postSerialized = JSON.stringify(postRow || {});

    const postUpgradeLeakClosed =
      Boolean(postRow) &&
      !('admin_notes' in postRow) &&
      !('payments' in postRow) &&
      !('ip_hash' in postRow) &&
      !postSerialized.includes(String(PRIVACY_FIXTURE_CONSTANTS.secretAmount)) &&
      !postSerialized.includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
      !postSerialized.includes(PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote) &&
      !postSerialized.includes(PRIVACY_FIXTURE_CONSTANTS.secretAdminNote) &&
      !postSerialized.includes(PRIVACY_FIXTURE_CONSTANTS.secretActorEmail) &&
      Array.isArray(postRow.activity_log) &&
      postRow.activity_log.length === 4;

    const passed = preUpgradeHadLeak && postUpgradeLeakClosed;
    results.push({
      scenarioNumber: nextScenario++,
      category: 'Executed Database Tests (PGlite PG16 — Upgrade Path)',
      name: 'Upgrade from 20261030 to 20261031 succeeds cleanly and closes bare amount/UTR activity_log leak and admin_notes exposure on existing data',
      passed,
      expected: 'pre2031ExposedBareTokensAndNotes=true -> post2031ZeroLeaksAnd4FixedSummaries=true',
      actual: `pre2031Exposed=${preUpgradeHadLeak}, post2031Closed=${postUpgradeLeakClosed} (activity_log len=${postRow?.activity_log?.length})`
    });
  } finally {
    await upgradeDb.close();
  }

  return results;
}
