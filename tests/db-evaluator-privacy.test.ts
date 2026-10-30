import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import {
  ResilientServicesService,
  SupabaseAuthLikeClient,
  SupabaseDatabaseLikeClient
} from '../src/lib/supabase.js';

export interface DbTestScenarioResult {
  scenarioNumber: number;
  category: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

/**
 * Deterministic migration order for a clean database installation:
 * - 20261028_services_architecture.sql creates service_divisions, service_catalog, service_relations
 * - 20261028_location_neutral_update.sql updates service_divisions and service_catalog
 * - 20261028_reorganize_services_6_divisions.sql upserts the 6 canonical divisions
 * - 20261028_creator_network_tables.sql creates creator_applications, creator_assets, creator_admin_users, creator_evaluations
 * - 20261029_fix_admin_auth_and_rls.sql hardens RLS policies and creates initial evaluator RPC
 * - 20261030_fix_evaluator_rpc_and_activity_leak.sql adds initial activity_log filter RPC
 * - 20261031_strict_evaluator_projection_and_notes_privacy.sql enforces allowlisted fixed-summary projection & excludes admin_notes
 * - 20261102_reconcile_service_catalogue_drafts.sql applies Step 1C nested-JSON projection + non-destructive 37-service draft seed
 * - 20261103_catalogue_reconciliation_review_and_draft_seed.sql ensures forward reconciliation & administrator review RPC
 *
 * Note: 20261101_step1c_evaluator_nested_json_and_catalog_seed.sql is preserved on disk as a historical
 * migration file (tested separately in the historical-applied upgrade suite) and superseded for clean
 * installs by 20261102 + 20261103 so that seed-generated approval_status values never auto-publish rows.
 */
export const DETERMINISTIC_MIGRATION_ORDER = [
  '20261028_services_architecture.sql',
  '20261028_location_neutral_update.sql',
  '20261028_reorganize_services_6_divisions.sql',
  '20261028_creator_network_tables.sql',
  '20261029_fix_admin_auth_and_rls.sql',
  '20261030_fix_evaluator_rpc_and_activity_leak.sql',
  '20261031_strict_evaluator_projection_and_notes_privacy.sql',
  '20261102_reconcile_service_catalogue_drafts.sql',
  '20261103_catalogue_reconciliation_review_and_draft_seed.sql',
  '20261104_creator_upload_sessions.sql',
  '20261105_submit_creator_application_rpc.sql',
  '20261106_harden_creator_submission_transaction.sql',
  '20261107_creator_upload_session_protection.sql'
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
export async function bootstrapSupabaseCompatiblePostgres(): Promise<PGlite> {
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
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE BYPASSRLS;
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

  await grantSupabaseTablePrivileges(db);
  return db;
}

export async function grantSupabaseTablePrivileges(db: PGlite): Promise<void> {
  await db.exec(`
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, PUBLIC;
    ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO anon, authenticated, PUBLIC;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, PUBLIC;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, PUBLIC;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, PUBLIC;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO anon, authenticated, PUBLIC;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated, PUBLIC;
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

export function buildNestedJsonPrivacyFixtures() {
  return {
    expected_rates: {
      ugc: '2500',
      sponsoredReel: '5000',
      // Allowlisted key containing a nested object with sensitive payment tokens (must be stripped)
      story: {
        amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount,
        reference_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr,
        notes: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote
      },
      // Unapproved keys containing sensitive payment tokens (must be stripped)
      last_payment_amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount,
      reference_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr,
      payment_notes: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote
    },
    audience_insights: {
      gender: '62% Male',
      age: '18-34',
      // Allowlisted key containing nested object (must be stripped)
      genderBreakdown: {
        secret_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr,
        amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount
      },
      // topLocations array containing valid string + injected object/number (non-strings must be stripped)
      topLocations: [
        'Chennai',
        'Coimbatore',
        { utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr },
        PRIVACY_FIXTURE_CONSTANTS.secretAmount
      ],
      // Unapproved key (must be stripped)
      confidential_note: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote
    },
    previous_collaborations: {
      hasPrior: true,
      details: 'Regional retail campaigns',
      // Unapproved keys with sensitive payment data (must be stripped)
      amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount,
      reference_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr,
      notes: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote
    },
    campaign_matches: [
      'Q4 Tech Launch',
      {
        amount: PRIVACY_FIXTURE_CONSTANTS.secretAmount,
        reference_utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr
      },
      PRIVACY_FIXTURE_CONSTANTS.secretAmount
    ],
    portfolio_urls: [
      'https://instagram.com/reel/1',
      'https://instagram.com/reel/2',
      {
        notes: PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote,
        utr: PRIVACY_FIXTURE_CONSTANTS.secretUtr
      }
    ]
  };
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

  // 3. Seed synthetic creator application with all 10 activity fixtures, Step 1C nested-JSON fixtures, payments, admin_notes, and ip_hash
  const activityFixtures = buildAllTenActivityLogFixtures();
  const nestedJsonFixtures = buildNestedJsonPrivacyFixtures();
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
      audience_insights,
      collaboration_preferences,
      expected_rates,
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
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10::jsonb, $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb,
      $17, $18::jsonb, $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb,
      true, true, true,
      'shortlisted',
      $23,
      $24::jsonb,
      $25::jsonb,
      $26::jsonb,
      88.50,
      $27
    ) ON CONFLICT (id) DO UPDATE SET
      audience_insights = EXCLUDED.audience_insights,
      expected_rates = EXCLUDED.expected_rates,
      previous_collaborations = EXCLUDED.previous_collaborations,
      portfolio_urls = EXCLUDED.portfolio_urls,
      campaign_matches = EXCLUDED.campaign_matches,
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
      JSON.stringify(nestedJsonFixtures.audience_insights),
      JSON.stringify(['Sponsored Reel / Short']),
      JSON.stringify(nestedJsonFixtures.expected_rates),
      JSON.stringify(nestedJsonFixtures.previous_collaborations),
      JSON.stringify(nestedJsonFixtures.portfolio_urls),
      PRIVACY_FIXTURE_CONSTANTS.secretAdminNote,
      JSON.stringify(nestedJsonFixtures.campaign_matches),
      JSON.stringify(paymentsFixture),
      JSON.stringify(activityFixtures),
      PRIVACY_FIXTURE_CONSTANTS.secretIpHash
    ]
  );
}

/**
 * Helper to execute SQL statements inside a transaction impersonating a specific Postgres role and JWT subject UUID.
 */
export async function runAsRole<T = any>(
  db: PGlite,
  pgRole: 'anon' | 'authenticated' | 'service_role',
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

const JSONB_COLUMNS_SET = new Set([
  'problems_solved',
  'target_customers',
  'benefits',
  'deliverables',
  'packages',
  'process_steps',
  'client_responsibilities',
  'exclusions',
  'additional_charges',
  'gallery',
  'faqs'
]);

const ALLOWED_TABLES_SET = new Set(['service_divisions', 'service_catalog', 'service_relations']);
const SAFE_IDENT_REGEX = /^[a-z_][a-z0-9_]*$/i;

function assertSafeIdentifier(ident: string): string {
  if (!SAFE_IDENT_REGEX.test(ident)) {
    throw new Error(`Unsafe SQL identifier: ${ident}`);
  }
  return ident;
}

/**
 * PostgREST-compatible query builder backed directly by PGlite PostgreSQL + RLS (`runAsRole`).
 * Allows `ResilientServicesService` to execute real SQL SELECT, INSERT, UPDATE, and DELETE
 * operations against PGlite with full PostgreSQL RLS enforcement (`anon` vs `authenticated` + `auth.uid()`).
 */
export function createPgliteSupabaseClient(
  db: PGlite,
  pgRole: 'anon' | 'authenticated',
  userId: string | null
): SupabaseDatabaseLikeClient {
  return {
    from(table: string) {
      if (!ALLOWED_TABLES_SET.has(table)) {
        throw new Error(`Unsupported table in test adapter: ${table}`);
      }

      let operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
      let selectCols = '*';
      let insertData: Record<string, any> | null = null;
      let updateData: Record<string, any> | null = null;
      const whereClauses: Array<{ type: 'eq' | 'in'; col: string; val: any }> = [];
      let orderClause: { col: string; ascending: boolean } | null = null;
      let rowMode: 'many' | 'single' | 'maybeSingle' = 'many';

      const executeQuery = async (): Promise<{ data: any; error: { message: string } | null }> => {
        try {
          const params: any[] = [];
          const buildWhereSql = (): string => {
            if (whereClauses.length === 0) return '';
            const parts: string[] = [];
            for (const w of whereClauses) {
              const col = assertSafeIdentifier(w.col);
              if (w.type === 'eq') {
                params.push(w.val);
                parts.push(`${col} = $${params.length}`);
              } else if (w.type === 'in') {
                const arr = Array.isArray(w.val) ? w.val : [];
                if (arr.length === 0) {
                  parts.push('1 = 0');
                } else {
                  const placeholders = arr.map((item: any) => {
                    params.push(item);
                    return `$${params.length}`;
                  });
                  parts.push(`${col} IN (${placeholders.join(', ')})`);
                }
              }
            }
            return ` WHERE ${parts.join(' AND ')}`;
          };

          const safeSelectCols =
            selectCols.trim() === '*'
              ? '*'
              : selectCols
                  .split(',')
                  .map((c) => assertSafeIdentifier(c.trim()))
                  .join(', ');

          let sql = '';

          if (operation === 'select') {
            sql = `SELECT ${safeSelectCols} FROM public.${table}${buildWhereSql()}`;
            if (orderClause) {
              const ordCol = assertSafeIdentifier(orderClause.col);
              sql += ` ORDER BY ${ordCol} ${orderClause.ascending ? 'ASC' : 'DESC'}`;
            }
          } else if (operation === 'insert' && insertData) {
            const keys = Object.keys(insertData).filter((k) => insertData![k] !== undefined);
            const colsSql = keys.map((k) => assertSafeIdentifier(k)).join(', ');
            const valsSql = keys
              .map((k) => {
                const v = insertData![k];
                if (JSONB_COLUMNS_SET.has(k) && v !== null) {
                  params.push(JSON.stringify(v));
                  return `$${params.length}::jsonb`;
                }
                params.push(v);
                return `$${params.length}`;
              })
              .join(', ');
            sql = `INSERT INTO public.${table} (${colsSql}) VALUES (${valsSql}) RETURNING ${safeSelectCols}`;
          } else if (operation === 'update' && updateData) {
            const keys = Object.keys(updateData).filter((k) => updateData![k] !== undefined);
            const setSql = keys
              .map((k) => {
                const col = assertSafeIdentifier(k);
                const v = updateData![k];
                if (JSONB_COLUMNS_SET.has(k) && v !== null) {
                  params.push(JSON.stringify(v));
                  return `${col} = $${params.length}::jsonb`;
                }
                params.push(v);
                return `${col} = $${params.length}`;
              })
              .join(', ');
            sql = `UPDATE public.${table} SET ${setSql}${buildWhereSql()} RETURNING ${safeSelectCols}`;
          } else if (operation === 'delete') {
            sql = `DELETE FROM public.${table}${buildWhereSql()} RETURNING ${safeSelectCols}`;
          }

          const res = await runAsRole(db, pgRole, userId, sql, params);

          if (rowMode === 'single') {
            if (res.rows.length !== 1) {
              return {
                data: null,
                error: {
                  message:
                    res.rows.length === 0
                      ? 'JSON object requested, multiple (or no) rows returned (0 rows)'
                      : `Multiple rows returned (${res.rows.length})`
                }
              };
            }
            return { data: res.rows[0], error: null };
          }

          if (rowMode === 'maybeSingle') {
            if (res.rows.length > 1) {
              return {
                data: null,
                error: { message: `Multiple rows returned (${res.rows.length})` }
              };
            }
            return { data: res.rows[0] || null, error: null };
          }

          return { data: res.rows, error: null };
        } catch (err: any) {
          return {
            data: null,
            error: { message: err?.message || String(err) }
          };
        }
      };

      const builder: any = {
        select(cols = '*') {
          selectCols = cols;
          return builder;
        },
        insert(payload: Record<string, any>) {
          operation = 'insert';
          insertData = payload;
          return builder;
        },
        update(payload: Record<string, any>) {
          operation = 'update';
          updateData = payload;
          return builder;
        },
        delete() {
          operation = 'delete';
          return builder;
        },
        eq(col: string, val: any) {
          whereClauses.push({ type: 'eq', col, val });
          return builder;
        },
        in(col: string, vals: any[]) {
          whereClauses.push({ type: 'in', col, val: vals });
          return builder;
        },
        order(col: string, opts?: { ascending?: boolean }) {
          orderClause = { col, ascending: opts?.ascending !== false };
          return builder;
        },
        single() {
          rowMode = 'single';
          return executeQuery();
        },
        maybeSingle() {
          rowMode = 'maybeSingle';
          return executeQuery();
        },
        then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
          return executeQuery().then(onFulfilled, onRejected);
        }
      };

      return builder;
    }
  };
}

export async function runDatabaseVerificationSuite(startScenarioNumber: number): Promise<DbTestScenarioResult[]> {
  const results: DbTestScenarioResult[] = [];
  let nextScenario = startScenarioNumber;
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

  // =========================================================================
  // PART A: FRESH DATABASE INSTALLATION TEST (All 8 migrations from scratch)
  // =========================================================================
  const freshDb = await bootstrapSupabaseCompatiblePostgres();
  const verQuery = await freshDb.query<{ version: string; server_version: string }>(
    `SELECT version() AS version, current_setting('server_version') AS server_version`
  );
  const pgServerVersion = verQuery.rows[0]?.server_version || 'unknown';
  const pgFullVersion = verQuery.rows[0]?.version || 'unknown';
  const freshCat = `Executed Database Tests (PGlite PG${pgServerVersion} — Fresh Install)`;
  const rlsCat = `Executed Database Tests (PGlite PG${pgServerVersion} — RLS & RPC Matrix)`;
  const upgradeCat = `Executed Database Tests (PGlite PG${pgServerVersion} — Upgrade Path)`;
  const persistCat = `Executed Database Tests (PGlite PG${pgServerVersion} — Catalogue Persistence & Multi-Session)`;

  console.log(`[Database Test Engine] ${pgFullVersion}\n`);

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
          'creator_evaluations',
          'creator_upload_sessions'
        )
      ORDER BY tablename
    `);

    const all8TablesHaveRls =
      tablesRes.rows.length === 8 && tablesRes.rows.every((r) => r.rowsecurity === true);

    const divCountRes = await freshDb.query<{ cnt: string }>(`
      SELECT count(*)::text AS cnt
      FROM public.service_divisions
      WHERE status = 'published'
    `);
    const srvDraftCountRes = await freshDb.query<{ cnt: string }>(`
      SELECT count(*)::text AS cnt
      FROM public.service_catalog
      WHERE status = 'draft' AND published_at IS NULL
    `);
    const srvPublishedCountRes = await freshDb.query<{ cnt: string }>(`
      SELECT count(*)::text AS cnt
      FROM public.service_catalog
      WHERE status = 'published'
    `);
    const freshDivCount = Number(divCountRes.rows[0]?.cnt || 0);
    const freshDraftSrvCount = Number(srvDraftCountRes.rows[0]?.cnt || 0);
    const freshPubSrvCount = Number(srvPublishedCountRes.rows[0]?.cnt || 0);

    results.push({
      scenarioNumber: nextScenario++,
      category: freshCat,
      name: 'Fresh database installation applies all 13 clean-install migrations cleanly (including forward migrations 20261102, 20261103, 20261104, 20261105, 20261106 & 20261107), enables RLS on all 8 public tables, seeds 6 divisions, and seeds all 37 canonical services strictly as drafts (0 auto-published)',
      passed:
        freshInstallError === null &&
        appliedFiles.length === 13 &&
        all8TablesHaveRls &&
        freshDivCount === 6 &&
        freshDraftSrvCount === 37 &&
        freshPubSrvCount === 0,
      expected: '13/13 migrations applied cleanly; 8/8 tables have rowsecurity=true; divisions=6, draftServices=37, publishedServices=0',
      actual: freshInstallError
        ? `Failed at migration #${appliedFiles.length + 1}: ${freshInstallError}`
        : `${appliedFiles.length}/13 migrations applied; RLS tables=${tablesRes.rows.length}/8; divisions=${freshDivCount}, draftServices=${freshDraftSrvCount}, publishedServices=${freshPubSrvCount}`
    });

    // Seed synthetic data in Fresh DB and run the 12 required assertions + 10 fixtures + Step 1C nested-JSON fixtures
    await seedSyntheticUsersAndData(freshDb);

    // -----------------------------------------------------------------------
    // Assertion 1: Anonymous access to creator_applications and evaluator RPC fails
    // -----------------------------------------------------------------------
    {
      let anonSelectRows: any[] = [];
      try {
        const anonSelect = await runAsRole(
          freshDb,
          'anon',
          null,
          `SELECT id FROM public.creator_applications`
        );
        anonSelectRows = anonSelect.rows;
      } catch {
        anonSelectRows = [];
      }

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

      const passed = anonSelectRows.length === 0 && anonRpcBlocked;
      results.push({
        scenarioNumber: nextScenario++,
        category: rlsCat,
        name: 'Assertion 1: Anonymous access to creator_applications (0 rows via RLS) and get_creator_applications_for_evaluator() (permission denied) fails',
        passed,
        expected: 'anon SELECT rows=0, anon RPC permission denied=true',
        actual: `anon SELECT rows=${anonSelectRows.length}, anon RPC blocked=${anonRpcBlocked} (${anonRpcError})`
      });
    }

    // -----------------------------------------------------------------------
    // Assertion 2 & 3: Ordinary authenticated user cannot read creator_applications,
    // cannot call evaluator RPC, cannot read/insert/update/delete creator_admin_users
    // (no self-promotion), and cannot modify service_catalog
    // -----------------------------------------------------------------------
    {
      const ordId = TEST_DB_USERS.ordinaryUser.id;
      let ordAppsRows: any[] = [];
      try {
        const ordApps = await runAsRole(
          freshDb,
          'authenticated',
          ordId,
          `SELECT id FROM public.creator_applications`
        );
        ordAppsRows = ordApps.rows;
      } catch {
        ordAppsRows = [];
      }

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

      let ordReadAdminsRows: any[] = [];
      try {
        const ordReadAdmins = await runAsRole(
          freshDb,
          'authenticated',
          ordId,
          `SELECT id FROM public.creator_admin_users`
        );
        ordReadAdminsRows = ordReadAdmins.rows;
      } catch {
        ordReadAdminsRows = [];
      }

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

      let ordUpdateCatalogRows: any[] = [];
      try {
        const ordUpdateCatalog = await runAsRole(
          freshDb,
          'authenticated',
          ordId,
          `UPDATE public.service_divisions SET name = 'Hacked' WHERE slug = 'websites-software' RETURNING id`
        );
        ordUpdateCatalogRows = ordUpdateCatalog.rows;
      } catch {
        ordUpdateCatalogRows = [];
      }

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
        ordAppsRows.length === 0 &&
        ordRpcDenied &&
        ordRpcMsg.includes('Access denied: Administrator membership required') &&
        ordReadAdminsRows.length === 0 &&
        selfPromotionBlocked &&
        ordUpdateCatalogRows.length === 0 &&
        ordInsertCatalogBlocked;

      results.push({
        scenarioNumber: nextScenario++,
        category: rlsCat,
        name: 'Assertions 2 & 3: Ordinary authenticated user blocked from creator_applications, evaluator RPC, creator_admin_users read/self-promotion, and service_catalog writes',
        passed,
        expected: 'apps=0, rpcDenied=true, adminsRead=0, selfPromoBlocked=true, catalogWritesBlocked=true',
        actual: `apps=${ordAppsRows.length}, rpcDenied=${ordRpcDenied}, adminsRead=${ordReadAdminsRows.length}, selfPromoBlocked=${selfPromotionBlocked}, catalogUpdateRows=${ordUpdateCatalogRows.length}, catalogInsertBlocked=${ordInsertCatalogBlocked}`
      });
    }

    // -----------------------------------------------------------------------
    // Assertions 4, 5, 6, 7, 8 + All 10 Activity Log Fixtures + Step 1C Nested-JSON Privacy
    // -----------------------------------------------------------------------
    {
      const evalId = TEST_DB_USERS.evaluator.id;

      // Assertion 4: Evaluator cannot directly read creator_applications table
      let directTableRows: any[] = [];
      try {
        const directTableRead = await runAsRole(
          freshDb,
          'authenticated',
          evalId,
          `SELECT * FROM public.creator_applications`
        );
        directTableRows = directTableRead.rows;
      } catch {
        directTableRows = [];
      }

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

      // Assertion 7: Never contains 98765, 98,765, ABC123XYZ, payment notes, admin notes, actor emails, or free-text details anywhere in row (including nested JSONB columns)
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

      // Step 1C Nested-JSON exact projection checks
      const nestedJsonProjectedCleanly =
        JSON.stringify(row?.expected_rates) === JSON.stringify({ ugc: '2500', sponsoredReel: '5000' }) &&
        JSON.stringify(row?.audience_insights) ===
          JSON.stringify({ age: '18-34', gender: '62% Male', topLocations: ['Chennai', 'Coimbatore'] }) &&
        JSON.stringify(row?.previous_collaborations) ===
          JSON.stringify({ details: 'Regional retail campaigns', hasPrior: true }) &&
        JSON.stringify(row?.campaign_matches) === JSON.stringify(['Q4 Tech Launch']) &&
        JSON.stringify(row?.portfolio_urls) ===
          JSON.stringify(['https://instagram.com/reel/1', 'https://instagram.com/reel/2']);

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
        directTableRows.length === 0 &&
        rpcRes.rows.length === 1 &&
        excludesSensitiveColumns &&
        hasNoLeakedTokens &&
        nestedJsonProjectedCleanly &&
        exactOrderAndShapeMatch &&
        malformedHandledSafely;

      results.push({
        scenarioNumber: nextScenario++,
        category: rlsCat,
        name: 'Assertions 4–8, All 10 Activity Fixtures & Step 1C Nested-JSON Privacy: Evaluator blocked from direct table SELECT, allowed via RPC, excludes payments/ip_hash/admin_notes, strips unapproved keys & nested objects from expected_rates/audience_insights/previous_collaborations/arrays, and preserves ordered fixed activity summaries',
        passed,
        expected: 'directSelect=0, rpcRows=1, excludesCols=true, noLeaks=true, nestedJsonClean=true, exactSummariesOrder=true, malformedSafe=true',
        actual: `directSelect=${directTableRows.length}, rpcRows=${rpcRes.rows.length}, excludesCols=${excludesSensitiveColumns}, noLeaks=${hasNoLeakedTokens}, nestedJsonClean=${nestedJsonProjectedCleanly}, exactSummariesOrder=${exactOrderAndShapeMatch}, malformedSafe=${malformedHandledSafely}`
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
        category: rlsCat,
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
        category: rlsCat,
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
        category: rlsCat,
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
  // PART B: UPGRADE PATH & MIGRATION RECONCILIATION REGRESSION SUITE
  //  Verifies:
  //  1. Upgrading from 20261030 -> 20261031 -> forward migrations (20261102 & 20261103)
  //     closes activity_log, admin_notes, AND Step 1C nested-JSON leaks on existing creator data.
  //  2. All 5 required migration reconciliation regression cases:
  //     - Intentionally archived custom division ('custom-archived-division') remains 'archived'.
  //     - Intentionally archived custom service ('custom-archived-service') remains 'archived'.
  //     - Existing draft service ('ecommerce-development' & 'custom-draft-service') remains 'draft'.
  //     - Existing approved publication ('website-development' with canonical seed UUID
  //       b0000000-0000-4000-8000-000000000001 and published_at = created_at = updated_at,
  //       plus 'custom-enterprise-div' and 'custom-bespoke-advisory') remains 'published'
  //       WITHOUT inferring approval from slugs, UUIDs, or timestamps.
  //     - Missing seed services (35 missing canonical services) are inserted as 'draft'
  //       (status = 'draft', published_at = NULL).
  //  3. Where historical intent is unknown, public.get_service_catalogue_reconciliation_review()
  //     reports affected records to administrators instead of automatically publishing or unpublishing them.
  //  4. Also verifies that on a database where historical 20261101 was already applied,
  //     running forward migration 20261103 preserves all existing archived/draft/published states
  //     without re-running old migrations and reports ambiguous records for review.
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
    const pre2031Res = await runAsRole<Record<string, any>>(
      upgradeDb,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `SELECT * FROM public.get_creator_applications_for_evaluator() WHERE id = $1`,
      [PRIVACY_FIXTURE_CONSTANTS.creatorId]
    );
    const pre2031Serialized = JSON.stringify(pre2031Res.rows[0] || {});
    const pre2031HadLeak =
      pre2031Serialized.includes(String(PRIVACY_FIXTURE_CONSTANTS.secretAmount)) &&
      pre2031Serialized.includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
      'admin_notes' in (pre2031Res.rows[0] || {});

    // Apply 20261031_strict_evaluator_projection_and_notes_privacy.sql
    const mig2031Sql = fs.readFileSync(
      path.join(migrationsDir, '20261031_strict_evaluator_projection_and_notes_privacy.sql'),
      'utf8'
    );
    await upgradeDb.exec(mig2031Sql);
    await grantSupabaseTablePrivileges(upgradeDb);

    // Observe post-2031 / pre-forward-migration behavior:
    // Activity log and admin_notes are filtered in 20261031, BUT nested JSONB fields
    // (expected_rates, audience_insights, previous_collaborations, campaign_matches)
    // still leak 98765 and ABC123XYZ, and service_catalog has 0 rows!
    const preForwardRes = await runAsRole<Record<string, any>>(
      upgradeDb,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `SELECT * FROM public.get_creator_applications_for_evaluator() WHERE id = $1`,
      [PRIVACY_FIXTURE_CONSTANTS.creatorId]
    );
    const preForwardRow = preForwardRes.rows[0];
    const preForwardNestedHadLeak =
      JSON.stringify(preForwardRow?.expected_rates || {}).includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
      JSON.stringify(preForwardRow?.audience_insights || {}).includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
      JSON.stringify(preForwardRow?.previous_collaborations || {}).includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr);

    // Pre-populate existing catalogue state before running forward migrations (20261102 & 20261103):
    //  a) Edit existing division 'websites-software' short_description
    //  b) Insert an intentionally archived custom division 'custom-archived-division' (status='archived')
    //  c) Insert a custom published division 'custom-enterprise-div' (status='published')
    //  d) Insert an existing approved publication 'website-development' using canonical seed UUID
    //     'b0000000-0000-4000-8000-000000000001' with published_at = created_at = updated_at (no artificial timestamp offset!)
    //  e) Insert an existing draft canonical service 'ecommerce-development' (status='draft')
    //  f) Insert an intentionally archived custom service 'custom-archived-service' (status='archived')
    //  g) Insert a custom draft service 'custom-draft-service' (status='draft')
    //  h) Insert a custom published service 'custom-bespoke-advisory' (status='published')
    await upgradeDb.exec(`
      UPDATE public.service_divisions
      SET short_description = 'Custom Admin Edited Division Copy'
      WHERE slug = 'websites-software';

      INSERT INTO public.service_divisions (id, name, slug, short_description, status, display_order)
      VALUES
        ('a8888888-8888-4888-8888-888888888888', 'Intentionally Archived Custom Division', 'custom-archived-division', 'Must remain archived after migration', 'archived', 98),
        ('a9999999-9999-4999-8999-999999999999', 'Custom Enterprise Division', 'custom-enterprise-div', 'Custom division', 'published', 7);

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at, created_at, updated_at, packages
      )
      SELECT
        'b0000000-0000-4000-8000-000000000001'::uuid,
        id,
        'Custom Edited Website Service',
        'website-development',
        'Custom edited short description',
        'published',
        1,
        now(),
        now(),
        now(),
        '[{"id":"pkg-custom","name":"Custom Package","approval_status":"approved"}]'::jsonb
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, packages
      )
      SELECT
        'b0000000-0000-4000-8000-000000000002'::uuid,
        id,
        'Unapproved E-commerce Draft',
        'ecommerce-development',
        'Draft under scoping',
        'draft',
        2,
        '[{"id":"pkg-unapproved","name":"Pending Scope","approval_status":"pending"}]'::jsonb
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order
      )
      SELECT
        'c0000000-0000-4000-8000-000000000097'::uuid,
        id,
        'Intentionally Archived Custom Service',
        'custom-archived-service',
        'Archived custom service must stay archived',
        'archived',
        97
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order
      )
      SELECT
        'c0000000-0000-4000-8000-000000000098'::uuid,
        id,
        'Custom Draft Service',
        'custom-draft-service',
        'Draft custom service must stay draft',
        'draft',
        98
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at
      )
      SELECT
        'c0000000-0000-4000-8000-000000000099'::uuid,
        id,
        'Custom Bespoke Advisory Service',
        'custom-bespoke-advisory',
        'Custom service created by admin',
        'published',
        99,
        now()
      FROM public.service_divisions WHERE slug = 'websites-software';
    `);

    // Apply forward migrations 20261102 and 20261103 (without re-running old migrations)
    const mig2102Sql = fs.readFileSync(
      path.join(migrationsDir, '20261102_reconcile_service_catalogue_drafts.sql'),
      'utf8'
    );
    const mig2103Sql = fs.readFileSync(
      path.join(migrationsDir, '20261103_catalogue_reconciliation_review_and_draft_seed.sql'),
      'utf8'
    );
    await upgradeDb.exec(mig2102Sql);
    await upgradeDb.exec(mig2103Sql);

    // 1. Verify post-upgrade evaluator privacy (nested-JSON + activity_log + columns)
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
      JSON.stringify(postRow.expected_rates) === JSON.stringify({ ugc: '2500', sponsoredReel: '5000' }) &&
      JSON.stringify(postRow.audience_insights) ===
        JSON.stringify({ age: '18-34', gender: '62% Male', topLocations: ['Chennai', 'Coimbatore'] }) &&
      JSON.stringify(postRow.previous_collaborations) ===
        JSON.stringify({ details: 'Regional retail campaigns', hasPrior: true }) &&
      Array.isArray(postRow.activity_log) &&
      postRow.activity_log.length === 4;

    // 2. Verify all 5 required regression cases:
    const divCheck = await upgradeDb.query<{ slug: string; short_description: string; status: string }>(`
      SELECT slug, short_description, status FROM public.service_divisions
    `);
    const archivedCustomDiv = divCheck.rows.find((d) => d.slug === 'custom-archived-division');
    const publishedCustomDiv = divCheck.rows.find((d) => d.slug === 'custom-enterprise-div');
    const editedDiv = divCheck.rows.find((d) => d.slug === 'websites-software');
    const publishedDivs = divCheck.rows.filter((d) => d.status === 'published');

    const srvCheck = await upgradeDb.query<{
      id: string;
      slug: string;
      service_name: string;
      status: string;
      published_at: string | null;
    }>(`
      SELECT id, slug, service_name, status, published_at FROM public.service_catalog
    `);
    const archivedCustomSrv = srvCheck.rows.find((s) => s.slug === 'custom-archived-service');
    const draftCanonicalSrv = srvCheck.rows.find((s) => s.slug === 'ecommerce-development');
    const draftCustomSrv = srvCheck.rows.find((s) => s.slug === 'custom-draft-service');
    const approvedCanonicalSrv = srvCheck.rows.find((s) => s.slug === 'website-development');
    const approvedCustomSrv = srvCheck.rows.find((s) => s.slug === 'custom-bespoke-advisory');
    const newlySeededSrvs = srvCheck.rows.filter(
      (s) =>
        ![
          'website-development',
          'ecommerce-development',
          'custom-archived-service',
          'custom-draft-service',
          'custom-bespoke-advisory'
        ].includes(s.slug)
    );

    const regression1ArchivedDivRemainsArchived = archivedCustomDiv?.status === 'archived';
    const regression2ArchivedSrvRemainsArchived = archivedCustomSrv?.status === 'archived';
    const regression3DraftRemainsDraft =
      draftCanonicalSrv?.status === 'draft' &&
      draftCanonicalSrv?.service_name === 'Unapproved E-commerce Draft' &&
      draftCustomSrv?.status === 'draft';
    const regression4ApprovedPubRemainsPublished =
      approvedCanonicalSrv?.status === 'published' &&
      approvedCanonicalSrv?.service_name === 'Custom Edited Website Service' &&
      approvedCustomSrv?.status === 'published' &&
      publishedCustomDiv?.status === 'published' &&
      editedDiv?.short_description === 'Custom Admin Edited Division Copy';
    const regression5MissingSeededAsDrafts =
      newlySeededSrvs.length === 35 &&
      newlySeededSrvs.every((s) => s.status === 'draft' && s.published_at === null);

    // 3. Verify administrator review RPC reports records with unknown historical intent to admin/superadmin
    //    and blocks evaluator/ordinary/anon
    const adminReviewRes = await runAsRole<{
      record_type: string;
      slug: string;
      current_status: string;
      review_category: string;
    }>(
      upgradeDb,
      'authenticated',
      TEST_DB_USERS.admin.id,
      `SELECT record_type, slug, current_status, review_category FROM public.get_service_catalogue_reconciliation_review()`
    );
    const reviewRows = adminReviewRes.rows;
    const reportsArchivedCustomDiv = reviewRows.some(
      (r) =>
        r.record_type === 'division' &&
        r.slug === 'custom-archived-division' &&
        r.current_status === 'archived' &&
        r.review_category === 'archived_division_unknown_intent'
    );
    const reportsArchivedCustomSrv = reviewRows.some(
      (r) =>
        r.record_type === 'service' &&
        r.slug === 'custom-archived-service' &&
        r.current_status === 'archived' &&
        r.review_category === 'archived_service_unknown_intent'
    );
    const reportsPublishedCanonicalSrv = reviewRows.some(
      (r) =>
        r.record_type === 'service' &&
        r.slug === 'website-development' &&
        r.current_status === 'published' &&
        r.review_category === 'published_canonical_service_verify_approval'
    );

    let evalReviewBlocked = false;
    try {
      await runAsRole(
        upgradeDb,
        'authenticated',
        TEST_DB_USERS.evaluator.id,
        `SELECT * FROM public.get_service_catalogue_reconciliation_review()`
      );
    } catch {
      evalReviewBlocked = true;
    }

    // 4. Also verify forward migration 20261103 on a database where historical 20261101 was ALREADY applied:
    const hist2101Db = await bootstrapSupabaseCompatiblePostgres();
    let hist2101ForwardVerified = false;
    try {
      const upTo2101 = [
        '20261028_services_architecture.sql',
        '20261028_location_neutral_update.sql',
        '20261028_reorganize_services_6_divisions.sql',
        '20261028_creator_network_tables.sql',
        '20261029_fix_admin_auth_and_rls.sql',
        '20261030_fix_evaluator_rpc_and_activity_leak.sql',
        '20261031_strict_evaluator_projection_and_notes_privacy.sql',
        '20261101_step1c_evaluator_nested_json_and_catalog_seed.sql'
      ];
      for (const filename of upTo2101) {
        await hist2101Db.exec(fs.readFileSync(path.join(migrationsDir, filename), 'utf8'));
      }
      await grantSupabaseTablePrivileges(hist2101Db);
      await seedSyntheticUsersAndData(hist2101Db);

      // Suppose an admin also intentionally archived a custom division after 20261101
      await hist2101Db.exec(`
        INSERT INTO public.service_divisions (id, name, slug, short_description, status, display_order)
        VALUES ('a7777777-7777-4777-8777-777777777777', 'Post-2101 Archived Custom Division', 'post-2101-archived-div', 'Must stay archived', 'archived', 90);
      `);

      // Apply ONLY forward migration 20261103 (do not re-run old migrations)
      await hist2101Db.exec(mig2103Sql);

      const post2103Div = await hist2101Db.query<{ status: string }>(
        `SELECT status FROM public.service_divisions WHERE slug = 'post-2101-archived-div'`
      );
      const post2103Review = await runAsRole<{ review_category: string }>(
        hist2101Db,
        'authenticated',
        TEST_DB_USERS.superadmin.id,
        `SELECT review_category FROM public.get_service_catalogue_reconciliation_review()`
      );
      const flaggedPublishedCanonicalCount = post2103Review.rows.filter(
        (r) => r.review_category === 'published_canonical_service_verify_approval'
      ).length;
      const flaggedArchivedDivCount = post2103Review.rows.filter(
        (r) => r.review_category === 'archived_division_unknown_intent'
      ).length;

      hist2101ForwardVerified =
        post2103Div.rows[0]?.status === 'archived' &&
        flaggedPublishedCanonicalCount === 25 &&
        flaggedArchivedDivCount === 1;
    } finally {
      await hist2101Db.close();
    }

    const catalogUpgradeVerified =
      publishedDivs.length === 7 &&
      regression1ArchivedDivRemainsArchived &&
      regression2ArchivedSrvRemainsArchived &&
      regression3DraftRemainsDraft &&
      regression4ApprovedPubRemainsPublished &&
      regression5MissingSeededAsDrafts &&
      reportsArchivedCustomDiv &&
      reportsArchivedCustomSrv &&
      reportsPublishedCanonicalSrv &&
      evalReviewBlocked &&
      hist2101ForwardVerified;

    const passed =
      pre2031HadLeak &&
      preForwardNestedHadLeak &&
      postUpgradeLeakClosed &&
      catalogUpgradeVerified;

    results.push({
      scenarioNumber: nextScenario++,
      category: upgradeCat,
      name: 'Upgrade & reconciliation regression suite: archived division remains archived, archived service remains archived, draft remains draft, approved publication remains published (without timestamp/UUID inference), 35 missing services seeded as drafts, and ambiguous records reported for admin review',
      passed,
      expected: 'archivedDiv=archived, archivedSrv=archived, draft=draft, published=published, missing35=draft, reviewRpc=verified, hist2101Forward=verified',
      actual: `archivedDiv=${archivedCustomDiv?.status}, archivedSrv=${archivedCustomSrv?.status}, draft=${draftCanonicalSrv?.status}/${draftCustomSrv?.status}, published=${approvedCanonicalSrv?.status}/${approvedCustomSrv?.status}, missingDrafts=${newlySeededSrvs.filter((s) => s.status === 'draft').length}/35, reviewReported=${reportsArchivedCustomDiv && reportsArchivedCustomSrv && reportsPublishedCanonicalSrv}, evalBlocked=${evalReviewBlocked}, hist2101Forward=${hist2101ForwardVerified}`
    });
  } finally {
    await upgradeDb.close();
  }

  // =========================================================================
  // PART C: UPGRADE FROM PARTIAL 4-MIGRATION STATE (0 DIVISIONS, 0 SERVICES)
  // =========================================================================
  const partialDb = await bootstrapSupabaseCompatiblePostgres();
  try {
    const partialInitialOrder = [
      '20261028_services_architecture.sql',
      '20261028_creator_network_tables.sql',
      '20261029_fix_admin_auth_and_rls.sql',
      '20261031_strict_evaluator_projection_and_notes_privacy.sql',
      '20261104_creator_upload_sessions.sql'
    ];
    for (const filename of partialInitialOrder) {
      const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
      await partialDb.exec(sql);
    }
    await grantSupabaseTablePrivileges(partialDb);
    await seedSyntheticUsersAndData(partialDb);

    const preDivs = await partialDb.query<{ cnt: string }>(`SELECT count(*)::text AS cnt FROM public.service_divisions`);
    const preSrvs = await partialDb.query<{ cnt: string }>(`SELECT count(*)::text AS cnt FROM public.service_catalog`);
    const preZeroState = Number(preDivs.rows[0]?.cnt || 0) === 0 && Number(preSrvs.rows[0]?.cnt || 0) === 0;

    // Apply the delta upgrade migrations (20261028_location_neutral_update + forward migrations 20261102 & 20261103)
    const locSql = fs.readFileSync(path.join(migrationsDir, '20261028_location_neutral_update.sql'), 'utf8');
    const reconcile2102Sql = fs.readFileSync(
      path.join(migrationsDir, '20261102_reconcile_service_catalogue_drafts.sql'),
      'utf8'
    );
    const reconcile2103Sql = fs.readFileSync(
      path.join(migrationsDir, '20261103_catalogue_reconciliation_review_and_draft_seed.sql'),
      'utf8'
    );
    await partialDb.exec(locSql);
    await partialDb.exec(reconcile2102Sql);
    await partialDb.exec(reconcile2103Sql);

    const postDivs = await partialDb.query<{ cnt: string }>(
      `SELECT count(*)::text AS cnt FROM public.service_divisions WHERE status = 'published'`
    );
    const postDraftSrvs = await partialDb.query<{ cnt: string }>(
      `SELECT count(*)::text AS cnt FROM public.service_catalog WHERE status = 'draft'`
    );
    const postPubSrvs = await partialDb.query<{ cnt: string }>(
      `SELECT count(*)::text AS cnt FROM public.service_catalog WHERE status = 'published'`
    );
    const postDivCount = Number(postDivs.rows[0]?.cnt || 0);
    const postDraftSrvCount = Number(postDraftSrvs.rows[0]?.cnt || 0);
    const postPubSrvCount = Number(postPubSrvs.rows[0]?.cnt || 0);

    const evalRes = await runAsRole<Record<string, any>>(
      partialDb,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `SELECT * FROM public.get_creator_applications_for_evaluator() WHERE id = $1`,
      [PRIVACY_FIXTURE_CONSTANTS.creatorId]
    );
    const evalRow = evalRes.rows[0];
    const evalJson = JSON.stringify(evalRow || {});
    const step1cClean =
      Boolean(evalRow) &&
      !evalJson.includes(PRIVACY_FIXTURE_CONSTANTS.secretUtr) &&
      !evalJson.includes(String(PRIVACY_FIXTURE_CONSTANTS.secretAmount)) &&
      JSON.stringify(evalRow.expected_rates) === JSON.stringify({ ugc: '2500', sponsoredReel: '5000' });

    const passed =
      preZeroState &&
      postDivCount === 6 &&
      postDraftSrvCount === 37 &&
      postPubSrvCount === 0 &&
      step1cClean;
    results.push({
      scenarioNumber: nextScenario++,
      category: upgradeCat,
      name: 'Existing-DB upgrade from partial 4-migration state (0 divisions, 0 services) cleanly seeds 6 divisions, 37 draft services (0 auto-published), and Step 1C nested-JSON privacy',
      passed,
      expected: 'pre=(0 divs, 0 srvs) -> post=(6 divs, 37 draft srvs, 0 pub srvs), step1cClean=true',
      actual: `preZeroState=${preZeroState}, postDivs=${postDivCount}, postDraftSrvs=${postDraftSrvCount}, postPubSrvs=${postPubSrvCount}, step1cClean=${step1cClean}`
    });
  } finally {
    await partialDb.close();
  }

  // =========================================================================
  // PART D: END-TO-END SUPABASE CATALOGUE PERSISTENCE & MULTI-SESSION TESTS
  //  Executes ResilientServicesService directly against a PGlite PostgreSQL
  //  test database with real PostgreSQL RLS (SET LOCAL ROLE anon/authenticated).
  // =========================================================================
  const catalogDb = await bootstrapSupabaseCompatiblePostgres();
  try {
    for (const filename of DETERMINISTIC_MIGRATION_ORDER) {
      const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
      await catalogDb.exec(sql);
    }
    await grantSupabaseTablePrivileges(catalogDb);
    await seedSyntheticUsersAndData(catalogDb);

    // Helper to create an isolated browser session connected to `catalogDb`
    const createBrowserSession = (
      role: 'anon' | 'superadmin' | 'admin' | 'evaluator' | 'ordinary'
    ): ResilientServicesService => {
      const userMap = {
        superadmin: TEST_DB_USERS.superadmin,
        admin: TEST_DB_USERS.admin,
        evaluator: TEST_DB_USERS.evaluator,
        ordinary: TEST_DB_USERS.ordinaryUser
      };
      const user = role === 'anon' ? null : userMap[role];
      const token = user ? `pg_session_token_${role}` : null;

      const authClient: SupabaseAuthLikeClient = {
        auth: {
          getSession: async () => ({
            data: { session: token ? { access_token: token } : null },
            error: null
          }),
          signInWithPassword: async () => ({
            data: { session: token ? { access_token: token } : null, user },
            error: null
          }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        }
      };

      const fetchImpl: typeof fetch = async (input: any, init?: any) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.endsWith('/api/admin/auth/me')) {
          const authHeader = init?.headers?.Authorization || init?.headers?.authorization || '';
          if (!authHeader.startsWith('Bearer ') || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
          }
          // Query actual creator_admin_users table in PGlite to verify membership
          const memRes = await catalogDb.query<{ role: string }>(
            `SELECT role FROM public.creator_admin_users WHERE authenticated_user_id = $1`,
            [user.id]
          );
          const dbRole = memRes.rows[0]?.role;
          if (!dbRole) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
          }
          return new Response(
            JSON.stringify({
              user: { id: user.id, email: user.email },
              role: dbRole
            }),
            { status: 200 }
          );
        }
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      };

      const dbClient = createPgliteSupabaseClient(
        catalogDb,
        role === 'anon' ? 'anon' : 'authenticated',
        user ? user.id : null
      );

      return new ResilientServicesService({
        authClient,
        dbClient,
        fetchImpl
      });
    };

    const adminSessionA = createBrowserSession('admin');
    const superadminSessionB = createBrowserSession('superadmin');
    const publicVisitorSession = createBrowserSession('anon');
    const evaluatorSession = createBrowserSession('evaluator');
    const ordinaryUserSession = createBrowserSession('ordinary');

    let createdDraftId = '';
    const targetDivisionId = 'a1000000-0000-0000-0000-000000000001'; // websites-software
    const seedWebsiteServiceId = 'b0000000-0000-4000-8000-000000000001'; // website-development

    // -----------------------------------------------------------------------
    // Scenario D1: Create & edit a draft as an authorized administrator;
    // confirm it receives a database UUID, survives refresh, and appears in
    // another browser session (along with service_relations and reordering).
    // -----------------------------------------------------------------------
    {
      const created = await adminSessionA.createService({
        division_id: targetDivisionId,
        service_name: 'Enterprise ERP & Tally Bridge',
        slug: 'enterprise-erp-tally-bridge',
        short_description: 'Initial draft summary for ERP connector.',
        full_description: 'Initial full scope.',
        problems_solved: ['Manual double entry'],
        target_customers: ['Manufacturers'],
        benefits: ['Automated ledger sync'],
        deliverables: ['ERP Connector v1'],
        packages: [],
        process_steps: [],
        client_responsibilities: [],
        exclusions: [],
        additional_charges: [],
        gallery: [],
        faqs: [],
        seo_title: 'Enterprise ERP & Tally Bridge | Unikorn360',
        seo_description: 'Initial SEO description',
        status: 'draft',
        display_order: 7
      });

      createdDraftId = created.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(createdDraftId);

      // Edit the draft in Session A
      const edited = await adminSessionA.updateService(createdDraftId, {
        short_description: 'Updated ERP & Tally two-way synchronization architecture.',
        deliverables: ['Bi-directional Voucher Sync', 'Audit Reconciliation Dashboard']
      });

      // Create a service relation in Session A
      const relation = await adminSessionA.createServiceRelation({
        service_id: createdDraftId,
        related_service_id: seedWebsiteServiceId,
        relation_type: 'recommended',
        display_order: 1
      });

      // Reorder divisions in Session A (swap #1 and #2, then restore or verify)
      const initialDivs = await adminSessionA.getDivisions({ includeDrafts: true });
      const reorderedDivIds = [
        initialDivs[1].id,
        initialDivs[0].id,
        ...initialDivs.slice(2).map((d) => d.id)
      ];
      await adminSessionA.reorderDivisions(reorderedDivIds);

      // Simulate browser refresh on Session A (brand-new ResilientServicesService instance)
      const adminSessionARefreshed = createBrowserSession('admin');
      const refreshedData = await adminSessionARefreshed.getAllServicesForAdmin();
      const refreshedDraft = refreshedData.services.find((s) => s.id === createdDraftId);

      // Check from independent Browser Session B (superadminSessionB)
      const sessionBDivView = await superadminSessionB.getDivisionBySlug('websites-software', {
        includeDrafts: true
      });
      const sessionBDraft = sessionBDivView?.services.find((s) => s.id === createdDraftId);
      const sessionBRelations = await superadminSessionB.getServiceRelations(createdDraftId);
      const sessionBDivs = await superadminSessionB.getDivisions({ includeDrafts: true });

      // Restore canonical division order 1..6 via Session B
      await superadminSessionB.reorderDivisions(initialDivs.map((d) => d.id));

      const passed =
        isUuid &&
        created.status === 'draft' &&
        created.published_at === null &&
        edited.short_description === 'Updated ERP & Tally two-way synchronization architecture.' &&
        refreshedDraft?.short_description === 'Updated ERP & Tally two-way synchronization architecture.' &&
        JSON.stringify(refreshedDraft?.deliverables) ===
          JSON.stringify(['Bi-directional Voucher Sync', 'Audit Reconciliation Dashboard']) &&
        sessionBDraft?.id === createdDraftId &&
        sessionBDraft?.status === 'draft' &&
        sessionBRelations.length === 1 &&
        sessionBRelations[0]?.id === relation.id &&
        sessionBDivs[0]?.id === initialDivs[1].id;

      results.push({
        scenarioNumber: nextScenario++,
        category: persistCat,
        name: 'Persistence 1: Authorized admin creates & edits a draft service (with UUID), creates a relation, and reorders divisions; changes survive refresh and appear in a second browser session',
        passed,
        expected: 'validUUID=true, status=draft, survivesRefresh=true, visibleInSessionB=true, relationSaved=true, divisionReorderPersisted=true',
        actual: `validUUID=${isUuid}, status=${created.status}, survivesRefresh=${Boolean(refreshedDraft)}, visibleInSessionB=${Boolean(sessionBDraft)}, relations=${sessionBRelations.length}, topDivAfterSwap=${sessionBDivs[0]?.slug}`
      });
    }

    // -----------------------------------------------------------------------
    // Scenario D2: Confirm public visitors cannot access the draft service
    // (nor any of the 37 unapproved draft seed services)
    // -----------------------------------------------------------------------
    {
      const publicDetailDraft = await publicVisitorSession.getServiceByDivisionAndSlug(
        'websites-software',
        'enterprise-erp-tally-bridge'
      );
      const publicDetailSeedDraft = await publicVisitorSession.getServiceByDivisionAndSlug(
        'websites-software',
        'website-development'
      );
      const publicDivision = await publicVisitorSession.getDivisionBySlug('websites-software');
      const publicAllServices = await publicVisitorSession.getAllPublishedServices();

      // Also verify direct SQL as ROLE anon returns 0 rows from service_catalog
      const rawAnonCatalog = await runAsRole(
        catalogDb,
        'anon',
        null,
        `SELECT id, slug, status FROM public.service_catalog`
      );

      const passed =
        publicDetailDraft === null &&
        publicDetailSeedDraft === null &&
        publicDivision !== null &&
        publicDivision.services.length === 0 &&
        publicDivision.division.published_service_count === 0 &&
        publicAllServices.length === 0 &&
        rawAnonCatalog.rows.length === 0;

      results.push({
        scenarioNumber: nextScenario++,
        category: persistCat,
        name: 'Persistence 2: Public visitors cannot access the newly created draft or the 37 draft seed services via website methods or direct SQL (RLS blocks all draft rows)',
        passed,
        expected: 'publicDetailDraft=null, publicDetailSeedDraft=null, publicDivisionServices=0, publicAllServices=0, rawAnonSqlRows=0',
        actual: `publicDetailDraft=${publicDetailDraft}, publicDetailSeedDraft=${publicDetailSeedDraft}, publicDivisionServices=${publicDivision?.services.length}, publicAllServices=${publicAllServices.length}, rawAnonSqlRows=${rawAnonCatalog.rows.length}`
      });
    }

    // -----------------------------------------------------------------------
    // Scenario D3: Publish the draft (and related service) and confirm it
    // appears publicly across directory, division, and detail views
    // -----------------------------------------------------------------------
    {
      const publishedSeed = await adminSessionA.publishService(seedWebsiteServiceId);
      const publishedCustom = await adminSessionA.publishService(createdDraftId);

      // Reorder the 2 published services in websites-software so custom service is #1
      await adminSessionA.reorderServices(targetDivisionId, [createdDraftId, seedWebsiteServiceId]);

      const publicDetail = await publicVisitorSession.getServiceByDivisionAndSlug(
        'websites-software',
        'enterprise-erp-tally-bridge'
      );
      const publicDivision = await publicVisitorSession.getDivisionBySlug('websites-software');
      const publicAllServices = await publicVisitorSession.getAllPublishedServices();
      const publicDivisionsList = await publicVisitorSession.getDivisions();
      const wsDivSummary = publicDivisionsList.find((d) => d.slug === 'websites-software');

      const passed =
        publishedCustom.status === 'published' &&
        Boolean(publishedCustom.published_at) &&
        publishedSeed.status === 'published' &&
        publicDetail !== null &&
        publicDetail.service.id === createdDraftId &&
        publicDetail.service.short_description ===
          'Updated ERP & Tally two-way synchronization architecture.' &&
        publicDetail.relatedServices.some((r) => r.id === seedWebsiteServiceId) &&
        publicDivision !== null &&
        publicDivision.services.length === 2 &&
        publicDivision.services[0]?.id === createdDraftId &&
        publicAllServices.length === 2 &&
        wsDivSummary?.published_service_count === 2;

      results.push({
        scenarioNumber: nextScenario++,
        category: persistCat,
        name: 'Persistence 3: Publishing the draft sets published_at and makes the service, its persisted order, and its published relations immediately visible to public visitors',
        passed,
        expected: 'status=published, publicDetailFound=true, relatedServiceLinked=true, publicDivisionServices=2 (ordered), published_service_count=2',
        actual: `status=${publishedCustom.status}, publicDetailFound=${Boolean(publicDetail)}, relatedLinked=${Boolean(publicDetail?.relatedServices.some((r) => r.id === seedWebsiteServiceId))}, publicDivisionServices=${publicDivision?.services.length}, firstSlug=${publicDivision?.services[0]?.slug}, count=${wsDivSummary?.published_service_count}`
      });
    }

    // -----------------------------------------------------------------------
    // Scenario D4: Unpublish the service (and test unpublishing parent division)
    // and confirm public access stops immediately
    // -----------------------------------------------------------------------
    {
      // 1. Unpublish custom service back to draft
      const unpublishedCustom = await superadminSessionB.unpublishService(createdDraftId);
      const publicDetailAfterUnpublish = await publicVisitorSession.getServiceByDivisionAndSlug(
        'websites-software',
        'enterprise-erp-tally-bridge'
      );
      const publicAllAfterServiceUnpublish = await publicVisitorSession.getAllPublishedServices();

      // 2. Unpublish parent division websites-software -> even published child service (website-development) must stop being publicly accessible
      await superadminSessionB.updateDivision(targetDivisionId, { status: 'draft' });
      const publicDivWhenParentDraft = await publicVisitorSession.getDivisionBySlug('websites-software');
      const publicChildWhenParentDraft = await publicVisitorSession.getServiceByDivisionAndSlug(
        'websites-software',
        'website-development'
      );
      const publicAllWhenParentDraft = await publicVisitorSession.getAllPublishedServices();

      // Restore parent division to published
      await superadminSessionB.updateDivision(targetDivisionId, { status: 'published' });

      const passed =
        unpublishedCustom.status === 'draft' &&
        unpublishedCustom.published_at === null &&
        publicDetailAfterUnpublish === null &&
        publicAllAfterServiceUnpublish.length === 1 &&
        publicAllAfterServiceUnpublish[0]?.id === seedWebsiteServiceId &&
        publicDivWhenParentDraft === null &&
        publicChildWhenParentDraft === null &&
        publicAllWhenParentDraft.length === 0;

      results.push({
        scenarioNumber: nextScenario++,
        category: persistCat,
        name: 'Persistence 4: Unpublishing a service (or its parent division) immediately stops public access across detail, division, and directory queries',
        passed,
        expected: 'unpublishedStatus=draft, published_at=null, publicDetailAfterUnpublish=null, remainingPublic=1, parentDraftBlocksChildren=true',
        actual: `status=${unpublishedCustom.status}, published_at=${unpublishedCustom.published_at}, publicDetail=${publicDetailAfterUnpublish}, remainingPublic=${publicAllAfterServiceUnpublish.length}, parentDraftBlocks=${publicChildWhenParentDraft === null && publicAllWhenParentDraft.length === 0}`
      });
    }

    // -----------------------------------------------------------------------
    // Scenario D5: Confirm unauthorized users (anon, ordinaryUser, evaluator)
    // cannot modify the catalogue, and failed writes throw errors without
    // falling back to localStorage or reporting fake success
    // -----------------------------------------------------------------------
    {
      const unauthorizedSessions = [
        { label: 'anon', session: publicVisitorSession },
        { label: 'ordinary', session: ordinaryUserSession },
        { label: 'evaluator', session: evaluatorSession }
      ];

      let allUnauthorizedBlocked = true;
      const blockedDetails: string[] = [];

      for (const { label, session } of unauthorizedSessions) {
        let createBlocked = false;
        let updateBlocked = false;
        let publishBlocked = false;
        let reorderBlocked = false;

        try {
          await session.createService({
            division_id: targetDivisionId,
            service_name: 'Unauthorized Service',
            slug: `unauth-${label}`,
            short_description: 'Should fail',
            full_description: '',
            problems_solved: [],
            target_customers: [],
            benefits: [],
            deliverables: [],
            packages: [],
            process_steps: [],
            client_responsibilities: [],
            exclusions: [],
            additional_charges: [],
            gallery: [],
            faqs: [],
            seo_title: '',
            seo_description: '',
            status: 'published',
            display_order: 99
          });
        } catch {
          createBlocked = true;
        }

        try {
          await session.updateService(createdDraftId, { service_name: 'Hacked Name' });
        } catch {
          updateBlocked = true;
        }

        try {
          await session.publishService(createdDraftId);
        } catch {
          publishBlocked = true;
        }

        try {
          await session.reorderDivisions([targetDivisionId]);
        } catch {
          reorderBlocked = true;
        }

        const roleAllBlocked = createBlocked && updateBlocked && publishBlocked && reorderBlocked;
        if (!roleAllBlocked) {
          allUnauthorizedBlocked = false;
        }
        blockedDetails.push(`${label}:create=${createBlocked}/update=${updateBlocked}/pub=${publishBlocked}/reorder=${reorderBlocked}`);
      }

      // Also verify that a failing database write by an authorized admin (e.g. duplicate slug constraint violation) throws an error and does not corrupt state
      let duplicateSlugRejected = false;
      try {
        await adminSessionA.createService({
          division_id: targetDivisionId,
          service_name: 'Duplicate Slug Attempt',
          slug: 'enterprise-erp-tally-bridge', // Already exists in targetDivisionId!
          short_description: 'Duplicate',
          full_description: '',
          problems_solved: [],
          target_customers: [],
          benefits: [],
          deliverables: [],
          packages: [],
          process_steps: [],
          client_responsibilities: [],
          exclusions: [],
          additional_charges: [],
          gallery: [],
          faqs: [],
          seo_title: '',
          seo_description: '',
          status: 'draft',
          display_order: 10
        });
      } catch {
        duplicateSlugRejected = true;
      }

      // Also verify admin cannot permanently delete a service (only superadmin can)
      let adminHardDeleteBlocked = false;
      try {
        await adminSessionA.deleteService(createdDraftId, false);
      } catch {
        adminHardDeleteBlocked = true;
      }

      // Superadmin CAN permanently delete the test service
      const superHardDeleted = await superadminSessionB.deleteService(createdDraftId, false);

      const passed =
        allUnauthorizedBlocked &&
        duplicateSlugRejected &&
        adminHardDeleteBlocked &&
        superHardDeleted === true;

      results.push({
        scenarioNumber: nextScenario++,
        category: persistCat,
        name: 'Persistence 5: Unauthorized users (anon, ordinary, evaluator) are blocked from all catalogue writes; duplicate-slug DB errors throw without fallback; only superadmin can hard-delete',
        passed,
        expected: 'allUnauthorizedBlocked=true, duplicateSlugRejected=true, adminHardDeleteBlocked=true, superHardDeleted=true',
        actual: `unauthBlocked=${allUnauthorizedBlocked} (${blockedDetails.join('; ')}), dupRejected=${duplicateSlugRejected}, adminHardDeleteBlocked=${adminHardDeleteBlocked}, superHardDeleted=${superHardDeleted}`
      });
    }
  } finally {
    await catalogDb.close();
  }

  return results;
}

/**
 * Dedicated Migration Reconciliation Regression Suite (Scenarios #35–#39):
 * Executes both 20261102_reconcile_service_catalogue_drafts.sql and
 * 20261103_catalogue_reconciliation_review_and_draft_seed.sql against a PGlite
 * PostgreSQL instance containing pre-existing custom and canonical records to
 * verify all 5 required regression cases:
 *  1. Intentionally archived custom division remains archived (before = archived -> after = archived).
 *  2. Intentionally archived custom service remains archived (before = archived -> after = archived).
 *  3. Draft remains draft (before = draft -> after = draft).
 *  4. Existing approved publication remains published (before = published -> after = published,
 *     even when using canonical UUID b0000000-...-0001 and published_at = created_at = updated_at).
 *  5. Missing seed services are inserted as drafts (status = 'draft', published_at = NULL).
 */
export async function runMigrationReconciliationRegressionSuite(
  startScenarioNumber: number
): Promise<DbTestScenarioResult[]> {
  const results: DbTestScenarioResult[] = [];
  let nextScenario = startScenarioNumber;
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

  const regDb = await bootstrapSupabaseCompatiblePostgres();
  try {
    const verQuery = await regDb.query<{ server_version: string }>(
      `SELECT current_setting('server_version') AS server_version`
    );
    const pgServerVersion = verQuery.rows[0]?.server_version || 'unknown';
    const regCat = `Executed Database Tests (PGlite PG${pgServerVersion} — Migration Reconciliation Regressions)`;

    // Apply baseline schema and RLS migrations prior to catalogue reconciliation
    const baselineMigrations = [
      '20261028_services_architecture.sql',
      '20261028_location_neutral_update.sql',
      '20261028_reorganize_services_6_divisions.sql',
      '20261028_creator_network_tables.sql',
      '20261029_fix_admin_auth_and_rls.sql',
      '20261030_fix_evaluator_rpc_and_activity_leak.sql',
      '20261031_strict_evaluator_projection_and_notes_privacy.sql',
      '20261104_creator_upload_sessions.sql'
    ];
    for (const filename of baselineMigrations) {
      await regDb.exec(fs.readFileSync(path.join(migrationsDir, filename), 'utf8'));
    }
    await grantSupabaseTablePrivileges(regDb);
    await seedSyntheticUsersAndData(regDb);

    // Seed pre-migration records representing the 4 pre-existing states:
    //  1) Intentionally archived custom division ('custom-archived-div', status = 'archived')
    //  2) Intentionally archived custom service ('custom-archived-srv', status = 'archived')
    //  3) Existing draft service ('ecommerce-development', status = 'draft', plus 'custom-draft-srv', status = 'draft')
    //  4) Existing approved publication ('website-development' with canonical seed UUID
    //     'b0000000-0000-4000-8000-000000000001' and published_at = created_at = updated_at,
    //     plus 'custom-published-div' and 'custom-published-srv' with status = 'published')
    await regDb.exec(`
      INSERT INTO public.service_divisions (id, name, slug, short_description, status, display_order)
      VALUES
        ('d1111111-1111-4111-8111-111111111111', 'Intentionally Archived Custom Division', 'custom-archived-div', 'Must remain archived', 'archived', 91),
        ('d2222222-2222-4222-8222-222222222222', 'Approved Custom Division', 'custom-published-div', 'Must remain published', 'published', 92);

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at, created_at, updated_at, packages
      )
      SELECT
        'b0000000-0000-4000-8000-000000000001'::uuid,
        id,
        'Owner Approved Website Development',
        'website-development',
        'Approved canonical service with identical timestamps',
        'published',
        1,
        now(),
        now(),
        now(),
        '[{"id":"pkg-approved","name":"Approved Tier","approval_status":"approved"}]'::jsonb
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at, packages
      )
      SELECT
        'b0000000-0000-4000-8000-000000000002'::uuid,
        id,
        'Draft E-commerce Development',
        'ecommerce-development',
        'Existing canonical draft service',
        'draft',
        2,
        NULL,
        '[{"id":"pkg-draft","name":"Draft Tier","approval_status":"draft"}]'::jsonb
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at
      )
      SELECT
        'e1111111-1111-4111-8111-111111111111'::uuid,
        id,
        'Intentionally Archived Custom Service',
        'custom-archived-srv',
        'Must remain archived',
        'archived',
        91,
        NULL
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at
      )
      SELECT
        'e2222222-2222-4222-8222-222222222222'::uuid,
        id,
        'Existing Custom Draft Service',
        'custom-draft-srv',
        'Must remain draft',
        'draft',
        92,
        NULL
      FROM public.service_divisions WHERE slug = 'websites-software';

      INSERT INTO public.service_catalog (
        id, division_id, service_name, slug, short_description, status, display_order, published_at
      )
      SELECT
        'e3333333-3333-4333-8333-333333333333'::uuid,
        id,
        'Approved Custom Service',
        'custom-published-srv',
        'Must remain published',
        'published',
        93,
        now()
      FROM public.service_divisions WHERE slug = 'websites-software';
    `);

    // Record "before" states
    const beforeDivRes = await regDb.query<{ slug: string; status: string }>(
      `SELECT slug, status FROM public.service_divisions WHERE slug IN ('custom-archived-div', 'custom-published-div')`
    );
    const beforeSrvRes = await regDb.query<{ slug: string; status: string }>(
      `SELECT slug, status FROM public.service_catalog`
    );
    const beforeArchivedDivStatus = beforeDivRes.rows.find((d) => d.slug === 'custom-archived-div')?.status;
    const beforeArchivedSrvStatus = beforeSrvRes.rows.find((s) => s.slug === 'custom-archived-srv')?.status;
    const beforeDraftCanonicalStatus = beforeSrvRes.rows.find((s) => s.slug === 'ecommerce-development')?.status;
    const beforeDraftCustomStatus = beforeSrvRes.rows.find((s) => s.slug === 'custom-draft-srv')?.status;
    const beforePubCanonicalStatus = beforeSrvRes.rows.find((s) => s.slug === 'website-development')?.status;
    const beforePubCustomStatus = beforeSrvRes.rows.find((s) => s.slug === 'custom-published-srv')?.status;
    const beforeTotalSrvCount = beforeSrvRes.rows.length;

    // Run both 20261102 and 20261103 forward reconciliation migrations
    const sql2102 = fs.readFileSync(
      path.join(migrationsDir, '20261102_reconcile_service_catalogue_drafts.sql'),
      'utf8'
    );
    const sql2103 = fs.readFileSync(
      path.join(migrationsDir, '20261103_catalogue_reconciliation_review_and_draft_seed.sql'),
      'utf8'
    );
    await regDb.exec(sql2102);
    await regDb.exec(sql2103);

    // Record "after" states
    const afterDivRes = await regDb.query<{ slug: string; status: string }>(
      `SELECT slug, status FROM public.service_divisions WHERE slug IN ('custom-archived-div', 'custom-published-div')`
    );
    const afterSrvRes = await regDb.query<{
      slug: string;
      service_name: string;
      status: string;
      published_at: string | null;
      packages: any[];
    }>(`SELECT slug, service_name, status, published_at, packages FROM public.service_catalog`);

    const afterArchivedDivStatus = afterDivRes.rows.find((d) => d.slug === 'custom-archived-div')?.status;
    const afterPubDivStatus = afterDivRes.rows.find((d) => d.slug === 'custom-published-div')?.status;
    const afterArchivedSrvStatus = afterSrvRes.rows.find((s) => s.slug === 'custom-archived-srv')?.status;
    const afterDraftCanonical = afterSrvRes.rows.find((s) => s.slug === 'ecommerce-development');
    const afterDraftCustom = afterSrvRes.rows.find((s) => s.slug === 'custom-draft-srv');
    const afterPubCanonical = afterSrvRes.rows.find((s) => s.slug === 'website-development');
    const afterPubCustom = afterSrvRes.rows.find((s) => s.slug === 'custom-published-srv');

    const insertedMissingServices = afterSrvRes.rows.filter(
      (s) =>
        ![
          'website-development',
          'ecommerce-development',
          'custom-archived-srv',
          'custom-draft-srv',
          'custom-published-srv'
        ].includes(s.slug)
    );

    // Also verify get_service_catalogue_reconciliation_review() reports custom-archived-div,
    // custom-archived-srv, and website-development for administrator review
    const reviewRes = await runAsRole<{
      record_type: string;
      slug: string;
      current_status: string;
      review_category: string;
    }>(
      regDb,
      'authenticated',
      TEST_DB_USERS.superadmin.id,
      `SELECT record_type, slug, current_status, review_category FROM public.get_service_catalogue_reconciliation_review()`
    );

    // Regression 1: Intentionally archived custom division remains archived
    const reg1Passed =
      beforeArchivedDivStatus === 'archived' &&
      afterArchivedDivStatus === 'archived' &&
      reviewRes.rows.some(
        (r) =>
          r.record_type === 'division' &&
          r.slug === 'custom-archived-div' &&
          r.current_status === 'archived' &&
          r.review_category === 'archived_division_unknown_intent'
      );
    results.push({
      scenarioNumber: nextScenario++,
      category: regCat,
      name: 'Regression 1: Intentionally archived custom division remains archived after 20261102 & 20261103 and is surfaced for admin review',
      passed: reg1Passed,
      expected: 'before=archived, after=archived, reportedInReviewRpc=true',
      actual: `before=${beforeArchivedDivStatus}, after=${afterArchivedDivStatus}, reportedInReviewRpc=${reviewRes.rows.some((r) => r.slug === 'custom-archived-div')}`
    });

    // Regression 2: Intentionally archived custom service remains archived
    const reg2Passed =
      beforeArchivedSrvStatus === 'archived' &&
      afterArchivedSrvStatus === 'archived' &&
      reviewRes.rows.some(
        (r) =>
          r.record_type === 'service' &&
          r.slug === 'custom-archived-srv' &&
          r.current_status === 'archived' &&
          r.review_category === 'archived_service_unknown_intent'
      );
    results.push({
      scenarioNumber: nextScenario++,
      category: regCat,
      name: 'Regression 2: Intentionally archived custom service remains archived after 20261102 & 20261103 and is surfaced for admin review',
      passed: reg2Passed,
      expected: 'before=archived, after=archived, reportedInReviewRpc=true',
      actual: `before=${beforeArchivedSrvStatus}, after=${afterArchivedSrvStatus}, reportedInReviewRpc=${reviewRes.rows.some((r) => r.slug === 'custom-archived-srv')}`
    });

    // Regression 3: Draft remains draft
    const reg3Passed =
      beforeDraftCanonicalStatus === 'draft' &&
      beforeDraftCustomStatus === 'draft' &&
      afterDraftCanonical?.status === 'draft' &&
      afterDraftCanonical?.published_at === null &&
      afterDraftCanonical?.service_name === 'Draft E-commerce Development' &&
      afterDraftCustom?.status === 'draft' &&
      afterDraftCustom?.published_at === null;
    results.push({
      scenarioNumber: nextScenario++,
      category: regCat,
      name: 'Regression 3: Existing canonical and custom draft services remain draft (with published_at = NULL and preserved edits)',
      passed: reg3Passed,
      expected: 'before=(draft, draft), after=(draft, draft), published_at=null',
      actual: `before=(${beforeDraftCanonicalStatus}, ${beforeDraftCustomStatus}), after=(${afterDraftCanonical?.status}, ${afterDraftCustom?.status}), published_at=(${afterDraftCanonical?.published_at}, ${afterDraftCustom?.published_at})`
    });

    // Regression 4: Existing approved publication remains published (without timestamp/UUID/slug inference)
    const reg4Passed =
      beforePubCanonicalStatus === 'published' &&
      beforePubCustomStatus === 'published' &&
      afterPubCanonical?.status === 'published' &&
      Boolean(afterPubCanonical?.published_at) &&
      afterPubCanonical?.service_name === 'Owner Approved Website Development' &&
      afterPubCustom?.status === 'published' &&
      afterPubDivStatus === 'published';
    results.push({
      scenarioNumber: nextScenario++,
      category: regCat,
      name: 'Regression 4: Existing approved canonical and custom publications remain published without inferring approval from UUIDs, slugs, or timestamps',
      passed: reg4Passed,
      expected: 'before=(published, published), after=(published, published), canonicalEditsPreserved=true',
      actual: `before=(${beforePubCanonicalStatus}, ${beforePubCustomStatus}), after=(${afterPubCanonical?.status}, ${afterPubCustom?.status}), customDiv=${afterPubDivStatus}, name="${afterPubCanonical?.service_name}"`
    });

    // Regression 5: Missing seed services are inserted as drafts
    const allMissingAreDraft =
      beforeTotalSrvCount === 5 &&
      insertedMissingServices.length === 35 &&
      insertedMissingServices.every(
        (s) =>
          s.status === 'draft' &&
          s.published_at === null &&
          Array.isArray(s.packages) &&
          s.packages.every((p: any) => p.approval_status === 'draft')
      );
    results.push({
      scenarioNumber: nextScenario++,
      category: regCat,
      name: 'Regression 5: All 35 missing canonical seed services are inserted strictly as drafts (status=draft, published_at=NULL, package approval_status=draft)',
      passed: allMissingAreDraft,
      expected: 'insertedCount=35, allStatusDraft=true, allPublishedAtNull=true, allPackageApprovalDraft=true',
      actual: `insertedCount=${insertedMissingServices.length}, draftCount=${insertedMissingServices.filter((s) => s.status === 'draft' && s.published_at === null).length}/35`
    });
  } finally {
    await regDb.close();
  }

  return results;
}

export async function runCreatorSubmissionRpcDatabaseVerificationSuite(): Promise<DbTestScenarioResult[]> {
  const results: DbTestScenarioResult[] = [];
  const dbCat = 'Executed Database Tests (PGlite PG18.6 — Transactional Application Submission RPC)';

  const db = await bootstrapSupabaseCompatiblePostgres();

  try {
    for (const migFile of DETERMINISTIC_MIGRATION_ORDER) {
      const migPath = path.join(process.cwd(), 'supabase', 'migrations', migFile);
      if (fs.existsSync(migPath)) {
        const sql = fs.readFileSync(migPath, 'utf-8');
        await db.exec(sql);
      }
    }

    const testAppId = '11111111-2222-3333-4444-555555555555';
    const testSessionId = 'sess_tx_test_1001';
    const testSecret = 'sec_tx_test_1001_abc';
    const testRef = 'U360-CR-TXTEST01';
    const validAssetPath = 'creators/samples/sample_reel_1001.mp4';

    const testSessionAssets = [
      [
        validAssetPath,
        {
          storagePath: validAssetPath,
          category: 'video_sample',
          originalFilename: 'sample_reel.mp4',
          mimeType: 'video/mp4',
          fileSize: 10485760
        }
      ]
    ];

    // Seed valid upload session in creator_upload_sessions
    await db.query(
      `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
       VALUES ($1, $2, 'verified', $3::jsonb, now() + interval '1 hour')`,
      [testSessionId, testSecret, JSON.stringify(testSessionAssets)]
    );

    const appData = {
      application_reference: testRef,
      full_name: 'Database Tx Test Applicant',
      whatsapp_number: '+919876543210',
      email: 'txtest.applicant@unikorn360.com',
      state: 'Tamil Nadu',
      district: 'Chennai',
      town: 'Chennai Central',
      contact_language: 'Tamil',
      social_platforms: ['Instagram'],
      creator_categories: ['Food & Culinary'],
      creator_classification: 'ugc',
      privacy_consent: true,
      contact_consent: true,
      brand_sharing_consent: true,
      application_status: 'approved', // INJECTION ATTEMPT: must be ignored and forced to pending
      admin_notes: 'CONFIDENTIAL_NOTE_INJECTION', // INJECTION ATTEMPT: must be ignored and forced to NULL
      payments: [{ amount: 999999 }], // INJECTION ATTEMPT: must be ignored and forced to empty
      campaign_matches: ['HACKED_CAMPAIGN'] // INJECTION ATTEMPT: must be ignored and forced to empty
    };

    const assets = [
      {
        file_type: 'video_sample',
        original_filename: 'sample_reel.mp4',
        storage_path: validAssetPath,
        mime_type: 'video/mp4',
        file_size: 10485760
      }
    ];

    // -------------------------------------------------------------------------
    // DB Test 60: anon and authenticated cannot execute submit_creator_application RPC
    // -------------------------------------------------------------------------
    let anonBlocked = false;
    let authBlocked = false;
    try {
      await runAsRole(
        db,
        'anon',
        null,
        `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
        [testSessionId, testSecret, testAppId, JSON.stringify(appData), JSON.stringify(assets)]
      );
    } catch (err: any) {
      anonBlocked = err.message?.includes('permission denied') || err.code === '42501';
    }

    try {
      await runAsRole(
        db,
        'authenticated',
        TEST_DB_USERS.ordinaryUser.id,
        `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
        [testSessionId, testSecret, testAppId, JSON.stringify(appData), JSON.stringify(assets)]
      );
    } catch (err: any) {
      authBlocked = err.message?.includes('permission denied') || err.code === '42501';
    }

    results.push({
      scenarioNumber: 60,
      category: dbCat,
      name: 'Transaction Test 1: anon and authenticated cannot execute submit_creator_application (permission denied 42501); service_role execution restricted',
      passed: anonBlocked && authBlocked,
      expected: 'anonBlocked=true (42501), authBlocked=true (42501)',
      actual: `anonBlocked=${anonBlocked}, authBlocked=${authBlocked}`
    });

    // -------------------------------------------------------------------------
    // DB Test 61: Expired sessions are rejected inside transaction
    // -------------------------------------------------------------------------
    const expiredSessionId = 'sess_tx_expired_001';
    const expiredSecret = 'sec_tx_expired_001';
    const expiredAppId = '22222222-1111-1111-1111-111111111111';

    await db.query(
      `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
       VALUES ($1, $2, 'verified', $3::jsonb, now() - interval '10 minutes')`,
      [expiredSessionId, expiredSecret, JSON.stringify(testSessionAssets)]
    );

    let expiredCaught = false;
    try {
      await runAsRole(
        db,
        'service_role',
        null,
        `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
        [expiredSessionId, expiredSecret, expiredAppId, JSON.stringify(appData), JSON.stringify(assets)]
      );
    } catch (err: any) {
      expiredCaught = err.message?.includes('EXPIRED_SESSION');
    }

    const checkExpiredApp = await db.query(`SELECT id FROM creator_applications WHERE id = $1`, [expiredAppId]);
    results.push({
      scenarioNumber: 61,
      category: dbCat,
      name: 'Transaction Test 2: Expired upload session is rejected inside transaction and leaves no application row',
      passed: expiredCaught && checkExpiredApp.rows.length === 0,
      expected: 'expiredCaught=true, appRowsCount=0',
      actual: `expiredCaught=${expiredCaught}, appRowsCount=${checkExpiredApp.rows.length}`
    });

    // -------------------------------------------------------------------------
    // DB Test 62: Foreign asset paths not belonging to session are rejected
    // -------------------------------------------------------------------------
    const foreignAssets = [
      {
        file_type: 'video_sample',
        original_filename: 'unissued.mp4',
        storage_path: 'creators/unissued_path_hacker.mp4',
        mime_type: 'video/mp4',
        file_size: 10485760
      }
    ];

    let foreignAssetCaught = false;
    try {
      await runAsRole(
        db,
        'service_role',
        null,
        `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
        [testSessionId, testSecret, testAppId, JSON.stringify(appData), JSON.stringify(foreignAssets)]
      );
    } catch (err: any) {
      foreignAssetCaught = err.message?.includes('FOREIGN_ASSET_PATH');
    }

    results.push({
      scenarioNumber: 62,
      category: dbCat,
      name: 'Transaction Test 3: Un-issued asset path not belonging to session is rejected with FOREIGN_ASSET_PATH',
      passed: foreignAssetCaught,
      expected: 'foreignAssetCaught=true',
      actual: `foreignAssetCaught=${foreignAssetCaught}`
    });

    // -------------------------------------------------------------------------
    // DB Test 63: First submission succeeds with service_role, enforces server-controlled fields
    // -------------------------------------------------------------------------
    const subRes = await runAsRole(
      db,
      'service_role',
      null,
      `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
      [testSessionId, testSecret, testAppId, JSON.stringify(appData), JSON.stringify(assets)]
    );
    const res1 = (subRes.rows[0] as any).res;

    const checkApp1 = await db.query<{
      id: string;
      application_status: string;
      admin_notes: string | null;
      payments: any;
      campaign_matches: any;
      activity_log: any;
    }>(`SELECT id, application_status, admin_notes, payments, campaign_matches, activity_log FROM creator_applications WHERE id = $1`, [testAppId]);
    const checkSess1 = await db.query<{ status: string; application_id: string | null }>(`SELECT status, application_id FROM creator_upload_sessions WHERE id = $1`, [testSessionId]);
    const checkAsset1 = await db.query<{ storage_path: string; file_type: string; application_id: string }>(`SELECT storage_path, file_type, application_id FROM creator_assets WHERE application_id = $1`, [testAppId]);

    const appRow = checkApp1.rows[0];
    const serverFieldsEnforced =
      appRow?.application_status === 'pending' &&
      appRow?.admin_notes === null &&
      JSON.stringify(appRow?.payments) === '[]' &&
      JSON.stringify(appRow?.campaign_matches) === '[]' &&
      Array.isArray(appRow?.activity_log) &&
      appRow?.activity_log[0]?.event_type === 'application_submitted';

    const test63Passed =
      res1?.success === true &&
      checkApp1.rows.length === 1 &&
      checkSess1.rows[0]?.status === 'completed' &&
      checkSess1.rows[0]?.application_id === testAppId &&
      checkAsset1.rows.length === 1 &&
      serverFieldsEnforced;

    results.push({
      scenarioNumber: 63,
      category: dbCat,
      name: 'Transaction Test 4: Submission succeeds under service_role with foreign keys enabled; forces server-controlled fields (status=pending, admin_notes=NULL)',
      passed: test63Passed,
      expected: 'rpcSuccess=true, status=pending, admin_notes=null, sessionBound=true, assetsCount=1',
      actual: `rpcSuccess=${res1?.success}, status=${appRow?.application_status}, admin_notes=${appRow?.admin_notes}, sessionStatus=${checkSess1.rows[0]?.status}, assetsCount=${checkAsset1.rows.length}`
    });

    // -------------------------------------------------------------------------
    // DB Test 64: Foreign asset path already owned by another application cannot be attached or reassigned
    // -------------------------------------------------------------------------
    const attackerSessionId = 'sess_tx_attacker_9009';
    const attackerSecret = 'sec_tx_attacker_9009';
    const attackerAppId = '99999999-9999-9999-9999-999999999999';

    // Even if attacker session artificially lists the existing asset path:
    const attackerAssets = [
      [
        validAssetPath,
        {
          storagePath: validAssetPath,
          category: 'video_sample',
          originalFilename: 'stolen.mp4',
          mimeType: 'video/mp4',
          fileSize: 10485760
        }
      ]
    ];

    await db.query(
      `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
       VALUES ($1, $2, 'verified', $3::jsonb, now() + interval '1 hour')`,
      [attackerSessionId, attackerSecret, JSON.stringify(attackerAssets)]
    );

    const attackerAppData = {
      ...appData,
      email: 'attacker@example.com',
      whatsapp_number: '+919999988888',
      application_reference: 'U360-CR-ATTACKER'
    };

    let hijackCaught = false;
    try {
      await runAsRole(
        db,
        'service_role',
        null,
        `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
        [attackerSessionId, attackerSecret, attackerAppId, JSON.stringify(attackerAppData), JSON.stringify(assets)]
      );
    } catch (err: any) {
      hijackCaught = err.message?.includes('FOREIGN_ASSET_PATH');
    }

    // Verify asset ownership was NOT reassigned to attackerAppId
    const checkOriginalOwner = await db.query<{ application_id: string }>(
      `SELECT application_id FROM creator_assets WHERE storage_path = $1`,
      [validAssetPath]
    );

    const test64Passed = hijackCaught && checkOriginalOwner.rows[0]?.application_id === testAppId;

    results.push({
      scenarioNumber: 64,
      category: dbCat,
      name: 'Transaction Test 5: Asset path already owned by an existing application cannot be hijacked or reassigned (FOREIGN_ASSET_PATH)',
      passed: test64Passed,
      expected: 'hijackCaught=true, ownerPreserved=true',
      actual: `hijackCaught=${hijackCaught}, currentOwner=${checkOriginalOwner.rows[0]?.application_id}`
    });

    // -------------------------------------------------------------------------
    // DB Test 65: Test rollback via test-only database trigger mechanism
    // -------------------------------------------------------------------------
    const rollbackSessionId = 'sess_tx_rollback_7007';
    const rollbackSecret = 'sec_tx_rollback_7007';
    const rollbackAppId = '77777777-7777-7777-7777-777777777777';
    const rollbackAssetPath = 'creators/samples/rollback_test.mp4';

    await db.query(
      `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
       VALUES ($1, $2, 'verified', $3::jsonb, now() + interval '1 hour')`,
      [rollbackSessionId, rollbackSecret, JSON.stringify([[rollbackAssetPath, { storagePath: rollbackAssetPath, category: 'video_sample', fileSize: 5000000 }]])]
    );

    const rollbackAppData = {
      ...appData,
      email: 'rollback.applicant@example.com',
      whatsapp_number: '+919876500001',
      application_reference: 'U360-CR-ROLLBACK'
    };

    const rollbackAssets = [
      {
        file_type: 'video_sample',
        original_filename: 'rollback_test.mp4',
        storage_path: rollbackAssetPath,
        mime_type: 'video/mp4',
        file_size: 5000000
      }
    ];

    // Create test-only failure trigger on creator_assets
    await db.exec(`
      CREATE OR REPLACE FUNCTION _test_abort_creator_assets() RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'SIMULATED_TEST_ROLLBACK_ERROR: Test abort trigger fired.'
          USING ERRCODE = 'P0001';
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_test_abort_assets ON creator_assets;
      CREATE TRIGGER trg_test_abort_assets
        BEFORE INSERT ON creator_assets
        FOR EACH ROW
        EXECUTE FUNCTION _test_abort_creator_assets();
    `);

    let rollbackErrorCaught = false;
    try {
      await runAsRole(
        db,
        'service_role',
        null,
        `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
        [rollbackSessionId, rollbackSecret, rollbackAppId, JSON.stringify(rollbackAppData), JSON.stringify(rollbackAssets)]
      );
    } catch (err: any) {
      rollbackErrorCaught = err.message?.includes('SIMULATED_TEST_ROLLBACK_ERROR');
    }

    // Drop the test trigger
    await db.exec(`
      DROP TRIGGER IF EXISTS trg_test_abort_assets ON creator_assets;
      DROP FUNCTION IF EXISTS _test_abort_creator_assets();
    `);

    // Verify complete rollback: no application row and session unbound
    const checkRollbackApp = await db.query(`SELECT id FROM creator_applications WHERE id = $1`, [rollbackAppId]);
    const checkRollbackSess = await db.query<{ status: string; application_id: string | null }>(`SELECT status, application_id FROM creator_upload_sessions WHERE id = $1`, [rollbackSessionId]);

    const test65Passed = rollbackErrorCaught && checkRollbackApp.rows.length === 0 && checkRollbackSess.rows[0]?.application_id === null;

    results.push({
      scenarioNumber: 65,
      category: dbCat,
      name: 'Transaction Test 6: Failed submission rolls back completely via test-only trigger, leaving no partially bound application row',
      passed: test65Passed,
      expected: 'rollbackCaught=true, appRowsCount=0, sessionBound=false',
      actual: `rollbackCaught=${rollbackErrorCaught}, appRowsCount=${checkRollbackApp.rows.length}, sessionBound=${checkRollbackSess.rows[0]?.application_id !== null}`
    });

    // -------------------------------------------------------------------------
    // DB Test 66: Authorized retry on same session succeeds and creates exactly one record
    // -------------------------------------------------------------------------
    const retryRes = await runAsRole(
      db,
      'service_role',
      null,
      `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
      [rollbackSessionId, rollbackSecret, rollbackAppId, JSON.stringify(rollbackAppData), JSON.stringify(rollbackAssets)]
    );
    const resRetry = (retryRes.rows[0] as any).res;

    const checkRetryApp = await db.query<{ id: string }>(`SELECT id FROM creator_applications WHERE id = $1`, [rollbackAppId]);
    const checkRetrySess = await db.query<{ status: string; application_id: string | null }>(`SELECT status, application_id FROM creator_upload_sessions WHERE id = $1`, [rollbackSessionId]);

    const test66Passed =
      resRetry?.success === true &&
      checkRetryApp.rows.length === 1 &&
      checkRetrySess.rows[0]?.status === 'completed' &&
      checkRetrySess.rows[0]?.application_id === rollbackAppId;

    results.push({
      scenarioNumber: 66,
      category: dbCat,
      name: 'Transaction Test 7: Authorized retry on same session succeeds and creates exactly one application record and session binding',
      passed: test66Passed,
      expected: 'retrySuccess=true, appRowsCount=1, sessionBound=true',
      actual: `retrySuccess=${resRetry?.success}, appCount=${checkRetryApp.rows.length}, boundAppId=${checkRetrySess.rows[0]?.application_id}`
    });

    // -------------------------------------------------------------------------
    // DB Test 67: Repeated call on completed session returns idempotent result
    // -------------------------------------------------------------------------
    const repeatRes = await runAsRole(
      db,
      'service_role',
      null,
      `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
      [testSessionId, testSecret, testAppId, JSON.stringify(appData), JSON.stringify(assets)]
    );
    const resRepeat = (repeatRes.rows[0] as any).res;

    const countApps = await db.query<{ cnt: string }>(`SELECT count(*)::text as cnt FROM creator_applications WHERE id = $1`, [testAppId]);

    const test67Passed =
      resRepeat?.success === true &&
      resRepeat?.already_completed === true &&
      resRepeat?.id === testAppId &&
      countApps.rows[0]?.cnt === '1';

    results.push({
      scenarioNumber: 67,
      category: dbCat,
      name: 'Transaction Test 8: Repeated submissions on completed session return idempotent result without creating duplicate records',
      passed: test67Passed,
      expected: 'already_completed=true, id=testAppId, rowCount=1',
      actual: `already_completed=${resRepeat?.already_completed}, id=${resRepeat?.id}, count=${countApps.rows[0]?.cnt}`
    });

  } finally {
    await db.close();
  }

  return results;
}


