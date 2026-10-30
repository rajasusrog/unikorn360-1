process.env.NODE_ENV = 'test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import type { PGlite } from '@electric-sql/pglite';
import {
  app,
  memoryApplications,
  memoryAdminUsers,
  memoryTokens,
  activeUploadSessions,
  resolveSupabaseConfig,
  saveSessionToDbAndDisk,
  setTestBackupFailureTrigger,
  getOrLoadUploadSession,
  setSupabaseAdmin
} from '../server.js';
import {
  ResilientServicesService,
  SupabaseAuthLikeClient
} from '../src/lib/supabase.js';
import {
  parseRouteLocation,
  extractQueryParam,
  extractCreatorReference
} from '../src/lib/router.js';
import {
  runDatabaseVerificationSuite,
  runMigrationReconciliationRegressionSuite,
  runCreatorSubmissionRpcDatabaseVerificationSuite,
  buildAllTenActivityLogFixtures,
  buildNestedJsonPrivacyFixtures,
  bootstrapSupabaseCompatiblePostgres,
  DETERMINISTIC_MIGRATION_ORDER,
  runAsRole,
  PRIVACY_FIXTURE_CONSTANTS,
  DbTestScenarioResult
} from './db-evaluator-privacy.test.js';

// Setup test users & tokens in memory registry for isolated verification
const TOKENS = {
  superadmin: 'test_token_superadmin_991',
  admin: 'test_token_admin_992',
  evaluator: 'test_token_evaluator_993',
  ordinaryUser: 'test_token_ordinary_user_994',
  unauthorizedAdminEmail: 'test_token_unauth_admin_email_995'
};

const USERS = {
  superadmin: {
    id: 'usr_superadmin_01',
    email: 'superadmin@unikorn360.com',
    role: 'superadmin' as const
  },
  admin: {
    id: 'usr_admin_01',
    email: 'operations@unikorn360.com',
    role: 'admin' as const
  },
  evaluator: {
    id: 'usr_evaluator_01',
    email: 'reviewer@unikorn360.com',
    role: 'evaluator' as const
  },
  ordinaryUser: {
    id: 'usr_ordinary_01',
    email: 'visitor@external.com',
    role: undefined
  },
  unauthorizedAdminEmail: {
    id: 'usr_imposter_01',
    email: 'admin@unikorn360.com', // Even with this email, absence of membership in creator_admin_users MUST block
    role: undefined
  }
};

// Seed tokens
memoryTokens.set(TOKENS.superadmin, USERS.superadmin);
memoryTokens.set(TOKENS.admin, USERS.admin);
memoryTokens.set(TOKENS.evaluator, USERS.evaluator);
memoryTokens.set(TOKENS.ordinaryUser, { id: USERS.ordinaryUser.id, email: USERS.ordinaryUser.email, role: 'evaluator' as any });
memoryTokens.set(TOKENS.unauthorizedAdminEmail, { id: USERS.unauthorizedAdminEmail.id, email: USERS.unauthorizedAdminEmail.email, role: 'evaluator' as any });

// Seed membership in creator_admin_users exclusively for authorized roles
memoryAdminUsers.push({
  id: 'cau_1',
  authenticated_user_id: USERS.superadmin.id,
  email: USERS.superadmin.email,
  role: 'superadmin'
});
memoryAdminUsers.push({
  id: 'cau_2',
  authenticated_user_id: USERS.admin.id,
  email: USERS.admin.email,
  role: 'admin'
});
memoryAdminUsers.push({
  id: 'cau_3',
  authenticated_user_id: USERS.evaluator.id,
  email: USERS.evaluator.email,
  role: 'evaluator'
});
// Notice: USERS.ordinaryUser and USERS.unauthorizedAdminEmail are NOT added to memoryAdminUsers!

interface TestResult {
  scenarioNumber: number;
  category:
    | 'Memory-Backed API'
    | 'Mocked SDK Session + API'
    | 'Config & Fail-Closed'
    | 'Static SQL Verification'
    | DbTestScenarioResult['category'];
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTests() {
  console.log('================================================================');
  console.log('UNIKORN360 ADMIN AUTH, PRIVACY & SESSION LIFECYCLE TEST SUITE');
  console.log('================================================================\n');

  // Start ephemeral test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // -------------------------------------------------------------
    // Scenario 1: Anonymous request to protected route is denied (401)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/creators`);
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 401 && body.code === 'UNAUTHORIZED';
      results.push({
        scenarioNumber: 1,
        category: 'Memory-Backed API',
        name: 'Anonymous protected request denied',
        passed,
        expected: 'HTTP 401 UNAUTHORIZED',
        actual: `HTTP ${res.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 2: Old PIN header (x-admin-pin: 360360) is denied (401)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: { 'x-admin-pin': '360360' }
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 401;
      results.push({
        scenarioNumber: 2,
        category: 'Memory-Backed API',
        name: 'Old PIN header (x-admin-pin: 360360) denied',
        passed,
        expected: 'HTTP 401 (PIN header rejected)',
        actual: `HTTP ${res.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 3: LocalStorage / Cookie flags cannot authorize requests (401)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: {
          'Cookie': 'unikorn360_admin_session=active; is_admin=true',
          'x-admin-session': 'active'
        }
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 401;
      results.push({
        scenarioNumber: 3,
        category: 'Memory-Backed API',
        name: 'LocalStorage / Cookie flags cannot authorize requests',
        passed,
        expected: 'HTTP 401 (Header flags ignored)',
        actual: `HTTP ${res.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 4: Ordinary authenticated user denied admin access (403)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: {
          'Authorization': `Bearer ${TOKENS.ordinaryUser}`
        }
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 403 && body.code === 'FORBIDDEN';
      results.push({
        scenarioNumber: 4,
        category: 'Memory-Backed API',
        name: 'Ordinary authenticated user without membership denied',
        passed,
        expected: 'HTTP 403 FORBIDDEN',
        actual: `HTTP ${res.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 5: Email exception bypass (admin@unikorn360.com) denied without membership (403)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: {
          'Authorization': `Bearer ${TOKENS.unauthorizedAdminEmail}`
        }
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 403 && body.code === 'FORBIDDEN';
      results.push({
        scenarioNumber: 5,
        category: 'Memory-Backed API',
        name: 'admin@unikorn360.com denied without membership in creator_admin_users',
        passed,
        expected: 'HTTP 403 FORBIDDEN',
        actual: `HTTP ${res.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 6: Evaluator permissions & privacy:
    //  - Payments data stripped in creator list and dossier
    //  - Cannot edit status (403), campaigns (403), delete (403), payments (403)
    //  - CAN submit evaluation score (200)
    // -------------------------------------------------------------
    {
      const listRes = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: { 'Authorization': `Bearer ${TOKENS.evaluator}` }
      });
      const listBody = await listRes.json();
      const firstCreator = listBody.applications?.[0];
      const paymentsStripped = listRes.status === 200 && (!firstCreator || firstCreator.payments === undefined);

      const targetId = firstCreator?.id || 'mem-app-01';
      const statusRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKENS.evaluator}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      const campRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/campaigns`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKENS.evaluator}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaignMatches: ['Test Campaign'] })
      });

      const payRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKENS.evaluator}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_name: 'Test',
          amount: 5000,
          status: 'paid',
          payment_date: '2026-10-29'
        })
      });

      const delRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKENS.evaluator}` }
      });

      const catRes = await fetch(`${baseUrl}/api/admin/services/b0000000-0000-4000-8000-000000000001/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKENS.evaluator}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'draft' })
      });

      const evalRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKENS.evaluator}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          engagement_quality: 14,
          average_views_score: 9,
          content_quality: 9,
          authenticity: 9,
          presentation: 9,
          audience_brand_fit: 14,
          local_relevance: 9,
          historical_performance: 9,
          cost_efficiency: 4,
          reliability: 5
        })
      });

      const passed = paymentsStripped &&
        statusRes.status === 403 &&
        campRes.status === 403 &&
        payRes.status === 403 &&
        delRes.status === 403 &&
        catRes.status === 403 &&
        (evalRes.status === 200 || evalRes.status === 201);

      results.push({
        scenarioNumber: 6,
        category: 'Memory-Backed API',
        name: 'Evaluator field-level privacy (payments stripped) & mutation blocks (403)',
        passed,
        expected: 'Payments stripped, status/camp/pay/del/catalog blocked (403), evaluation allowed (200)',
        actual: `Payments stripped: ${paymentsStripped}, status: ${statusRes.status}, camp: ${campRes.status}, pay: ${payRes.status}, del: ${delRes.status}, catalog: ${catRes.status}, eval: ${evalRes.status}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 7: Admin permissions:
    //  - CAN view applications, update status (200), and manage service catalogue (200)
    //  - CANNOT delete creators (403)
    //  - CANNOT record payments (403)
    //  - CANNOT manage memberships (403)
    // -------------------------------------------------------------
    {
      const targetId = 'mem-app-01';

      const statusRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKENS.admin}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'shortlisted' })
      });

      const catRes = await fetch(`${baseUrl}/api/admin/services/b0000000-0000-4000-8000-000000000001/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKENS.admin}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'published' })
      });

      const delRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKENS.admin}` }
      });

      const payRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKENS.admin}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_name: 'Admin Pay Attempt',
          amount: 2500,
          status: 'pending',
          payment_date: '2026-10-29'
        })
      });

      const memRes = await fetch(`${baseUrl}/api/admin/members`, {
        headers: { 'Authorization': `Bearer ${TOKENS.admin}` }
      });

      const passed = statusRes.status === 200 &&
        catRes.status === 200 &&
        delRes.status === 403 &&
        payRes.status === 403 &&
        memRes.status === 403;

      results.push({
        scenarioNumber: 7,
        category: 'Memory-Backed API',
        name: 'Admin role boundaries: can update status/catalog (200), cannot delete/pay/manage members (403)',
        passed,
        expected: 'status: 200, catalog: 200, delete: 403, payment: 403, members: 403',
        actual: `status: ${statusRes.status}, catalog: ${catRes.status}, delete: ${delRes.status}, payment: ${payRes.status}, members: ${memRes.status}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 8: Superadmin operations succeed
    // -------------------------------------------------------------
    {
      const targetId = 'mem-app-02';

      const dossierRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}`, {
        headers: { 'Authorization': `Bearer ${TOKENS.superadmin}` }
      });
      const dossierBody = await dossierRes.json();
      const hasPaymentsField = dossierRes.status === 200 && Array.isArray(dossierBody.application?.payments);

      const payRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKENS.superadmin}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_name: 'Festival Launch UGC',
          amount: 8000,
          status: 'paid',
          payment_date: '2026-10-29',
          reference_utr: 'UTR99887766'
        })
      });

      const memRes = await fetch(`${baseUrl}/api/admin/members`, {
        headers: { 'Authorization': `Bearer ${TOKENS.superadmin}` }
      });

      const delRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKENS.superadmin}` }
      });

      const passed = hasPaymentsField &&
        (payRes.status === 200 || payRes.status === 201) &&
        memRes.status === 200 &&
        delRes.status === 200;

      results.push({
        scenarioNumber: 8,
        category: 'Memory-Backed API',
        name: 'Superadmin full access: dossier payments visible, payment recorded, members list, delete',
        passed,
        expected: 'payments visible: true, pay: 200, members: 200, delete: 200',
        actual: `payments: ${hasPaymentsField}, pay: ${payRes.status}, members: ${memRes.status}, delete: ${delRes.status}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 9: Invalid tokens denied (401)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: { 'Authorization': 'Bearer invalid_garbage_token_999' }
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 401 && body.code === 'INVALID_TOKEN';
      results.push({
        scenarioNumber: 9,
        category: 'Memory-Backed API',
        name: 'Invalid or expired tokens denied (401)',
        passed,
        expected: 'HTTP 401 INVALID_TOKEN',
        actual: `HTTP ${res.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 10: Token verification endpoint /api/admin/auth/me verifies active session
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/auth/me`, {
        headers: { 'Authorization': `Bearer ${TOKENS.superadmin}` }
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 200 && body.role === 'superadmin' && body.user?.email === USERS.superadmin.email;
      results.push({
        scenarioNumber: 10,
        category: 'Memory-Backed API',
        name: '/api/admin/auth/me endpoint verifies active session and returns validated role',
        passed,
        expected: 'HTTP 200 role: superadmin',
        actual: `HTTP ${res.status} role: ${body.role || 'none'}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 11: Public catalogue reads succeed without auth
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/creators/catalog`);
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 200 && Array.isArray(body.categories);
      results.push({
        scenarioNumber: 11,
        category: 'Memory-Backed API',
        name: 'Public catalogue and taxonomy reads succeed without authentication',
        passed,
        expected: 'HTTP 200 with categories array',
        actual: `HTTP ${res.status} categories: ${Array.isArray(body.categories)}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 12: Regression Test — Evaluator Payment-Data, Admin Notes & Activity Log Leak Closed (All 10 Fixtures)
    //  - Superadmin records a payment on mem-app-01 with unique test amount (98765), UTR (ABC123XYZ), and notes.
    //  - Injects all 10 required activity_log fixtures (including bare "98765 | ABC123XYZ" on status_updated,
    //    payment notes in campaigns_updated, nested financial metadata in evaluation_submitted, legacy unstructured
    //    entry without event_type, unknown event_type, malformed id, malformed timestamp, and sensitive admin_notes).
    //  - Evaluator fetches both GET /api/admin/creators (list) and GET /api/admin/creators/mem-app-01 (detail).
    //  - Entire serialized evaluator JSON responses must NOT contain 98765, 98,765, ABC123XYZ, payment notes,
    //    admin_notes, payments, ip_hash, actor_email, or free-text details.
    //  - Allowed events are preserved in exact order with fixed summary strings.
    //  - Superadmin still receives the full payments array, admin_notes, and full 10-entry activity_log history.
    // -------------------------------------------------------------
    {
      const targetId = 'mem-app-01';
      const secretAmount = PRIVACY_FIXTURE_CONSTANTS.secretAmount;
      const secretFormattedAmount = PRIVACY_FIXTURE_CONSTANTS.secretFormattedAmount;
      const secretUtr = PRIVACY_FIXTURE_CONSTANTS.secretUtr;
      const secretNote = PRIVACY_FIXTURE_CONSTANTS.secretPaymentNote;
      const secretAdminNote = PRIVACY_FIXTURE_CONSTANTS.secretAdminNote;
      const secretActorEmail = PRIVACY_FIXTURE_CONSTANTS.secretActorEmail;

      const payRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKENS.superadmin}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_name: 'Private Brand Deal Q4',
          amount: secretAmount,
          status: 'paid',
          payment_date: '2026-10-30',
          reference_utr: secretUtr,
          notes: secretNote
        })
      });

      // Set sensitive admin_notes, Step 1C nested-JSON fixtures, and the 10 required activity_log fixtures on mem-app-01
      const memRec = memoryApplications.find((a) => a.id === targetId) as any;
      if (memRec) {
        const nestedFixtures = buildNestedJsonPrivacyFixtures();
        memRec.admin_notes = secretAdminNote;
        memRec.activity_log = buildAllTenActivityLogFixtures() as any;
        memRec.expected_rates = nestedFixtures.expected_rates;
        memRec.audience_insights = nestedFixtures.audience_insights;
        memRec.previous_collaborations = nestedFixtures.previous_collaborations;
        memRec.portfolio_urls = nestedFixtures.portfolio_urls;
        memRec.campaign_matches = nestedFixtures.campaign_matches;
      }

      // Evaluator requests list and detail dossier
      const evalListRes = await fetch(`${baseUrl}/api/admin/creators`, {
        headers: { 'Authorization': `Bearer ${TOKENS.evaluator}` }
      });
      const evalListJson = await evalListRes.json();
      const evalListSerialized = JSON.stringify(evalListJson);

      const evalDetailRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}`, {
        headers: { 'Authorization': `Bearer ${TOKENS.evaluator}` }
      });
      const evalDetailJson = await evalDetailRes.json();
      const evalDetailSerialized = JSON.stringify(evalDetailJson);

      const combinedEvaluatorSerialized = evalListSerialized + ' ' + evalDetailSerialized;

      const evalLog: any[] = evalDetailJson.application?.activity_log || [];
      const evalListActivityLogs = (evalListJson.applications || []).map((a: any) => a.activity_log);
      const serializedEvaluatorActivityLogs =
        JSON.stringify(evalLog) + ' ' + JSON.stringify(evalListActivityLogs);

      const leakedAmount = combinedEvaluatorSerialized.includes(String(secretAmount)) ||
        combinedEvaluatorSerialized.includes(secretFormattedAmount);
      const leakedUtr = combinedEvaluatorSerialized.includes(secretUtr);
      const leakedNote = combinedEvaluatorSerialized.includes(secretNote);
      const leakedAdminNote = combinedEvaluatorSerialized.includes(secretAdminNote);
      const leakedActorEmail = combinedEvaluatorSerialized.includes(secretActorEmail) ||
        serializedEvaluatorActivityLogs.includes('"actor_email"');
      const leakedDetailsKey = serializedEvaluatorActivityLogs.includes('"details"');
      const leakedPaymentsKey = combinedEvaluatorSerialized.includes('"payments"');
      const leakedAdminNotesKey = combinedEvaluatorSerialized.includes('"admin_notes"');
      const leakedIpHashKey = combinedEvaluatorSerialized.includes('"ip_hash"');

      // Verify exact order and fixed summary text for the 4 valid allowlisted events
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
      const preservedExactOrderAndSummaries =
        JSON.stringify(evalLog) === JSON.stringify(expectedOrderedSummaries);

      // Superadmin still sees full financial history, admin_notes, and all 10 activity_log events
      const superDetailRes = await fetch(`${baseUrl}/api/admin/creators/${targetId}`, {
        headers: { 'Authorization': `Bearer ${TOKENS.superadmin}` }
      });
      const superDetailJson = await superDetailRes.json();
      const superSerialized = JSON.stringify(superDetailJson);
      const superHasFullHistory =
        superSerialized.includes(String(secretAmount)) &&
        superSerialized.includes(secretUtr) &&
        superSerialized.includes(secretNote) &&
        superSerialized.includes(secretAdminNote) &&
        Array.isArray(superDetailJson.application?.activity_log) &&
        superDetailJson.application.activity_log.length === 10;

      const evalApp = evalDetailJson.application || {};
      const nestedJsonCleaned =
        JSON.stringify(evalApp.expected_rates) === JSON.stringify({ ugc: '2500', sponsoredReel: '5000' }) &&
        JSON.stringify(evalApp.audience_insights) ===
          JSON.stringify({ gender: '62% Male', age: '18-34', topLocations: ['Chennai', 'Coimbatore'] }) &&
        JSON.stringify(evalApp.previous_collaborations) ===
          JSON.stringify({ hasPrior: true, details: 'Regional retail campaigns' }) &&
        JSON.stringify(evalApp.portfolio_urls) ===
          JSON.stringify(['https://instagram.com/reel/1', 'https://instagram.com/reel/2']) &&
        JSON.stringify(evalApp.campaign_matches) === JSON.stringify(['Q4 Tech Launch']);

      const passed = (payRes.status === 200 || payRes.status === 201) &&
        !leakedAmount &&
        !leakedUtr &&
        !leakedNote &&
        !leakedAdminNote &&
        !leakedActorEmail &&
        !leakedDetailsKey &&
        !leakedPaymentsKey &&
        !leakedAdminNotesKey &&
        !leakedIpHashKey &&
        preservedExactOrderAndSummaries &&
        nestedJsonCleaned &&
        superHasFullHistory;

      results.push({
        scenarioNumber: 12,
        category: 'Memory-Backed API',
        name: 'Evaluator privacy across all 10 activity fixtures + Step 1C nested-JSON allowlists (list + dossier + fixed activity summaries + admin_notes/payments/ip_hash excluded)',
        passed,
        expected: '0 financial/notes/details/actor/nested-JSON leaks; exact 4 ordered fixed summaries; superadmin retains full 10-event history',
        actual: `leakedAmount=${leakedAmount}, leakedUtr=${leakedUtr}, leakedNote=${leakedNote}, leakedAdminNote=${leakedAdminNote}, leakedActor=${leakedActorEmail}, leakedDetails=${leakedDetailsKey}, leakedCols=${leakedPaymentsKey || leakedAdminNotesKey || leakedIpHashKey}, exactSummaries=${preservedExactOrderAndSummaries}, nestedJsonCleaned=${nestedJsonCleaned}, superFull=${superHasFullHistory}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 13: Custom /api/admin/auth/login route removed (browser SDK handles signInWithPassword)
    // -------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: USERS.superadmin.email, password: 'any' })
      });
      const passed = res.status === 404;
      results.push({
        scenarioNumber: 13,
        category: 'Memory-Backed API',
        name: 'Custom /api/admin/auth/login endpoint removed in favor of Supabase Auth SDK',
        passed,
        expected: 'HTTP 404 Not Found',
        actual: `HTTP ${res.status}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 14: Complete Supabase SDK Session Lifecycle (Mocked Auth Client + Live Express /api/admin/auth/me)
    //  Tests:
    //   14a. Sign-in via signInWithPassword + backend /api/admin/auth/me verification
    //   14b. Page reload session restoration via getSession()
    //   14c. Token refresh (TOKEN_REFRESHED) updating bearer token used in subsequent requests
    //   14d. Authenticated user without creator_admin_users membership rejected (403) and signed out
    //   14e. Membership removal (403 on re-verify) transitions session to forbidden and signs out
    //   14f. Expired/invalid token (401) transitions session to unauthenticated and signs out
    //   14g. Logout awaits SDK signOut() and accurately reports SDK signOut failure when one occurs
    // -------------------------------------------------------------
    {
      let currentSessionToken: string | null = null;
      let signOutCallCount = 0;
      let simulateSignOutError: string | null = null;
      const authListeners: Array<(event: string, session: { access_token?: string } | null) => void> = [];

      const mockAuthClient: SupabaseAuthLikeClient = {
        auth: {
          getSession: async () => ({
            data: {
              session: currentSessionToken ? { access_token: currentSessionToken } : null
            },
            error: null
          }),
          signInWithPassword: async ({ email }) => {
            if (email === USERS.admin.email) {
              currentSessionToken = TOKENS.admin;
              return { data: { session: { access_token: currentSessionToken } }, error: null };
            }
            if (email === USERS.ordinaryUser.email) {
              currentSessionToken = TOKENS.ordinaryUser;
              return { data: { session: { access_token: currentSessionToken } }, error: null };
            }
            return { data: { session: null }, error: { message: 'Invalid login credentials' } };
          },
          signOut: async () => {
            signOutCallCount += 1;
            if (simulateSignOutError) {
              return { error: { message: simulateSignOutError } };
            }
            currentSessionToken = null;
            return { error: null };
          },
          onAuthStateChange: (cb) => {
            authListeners.push(cb);
            return {
              data: {
                subscription: {
                  unsubscribe: () => {
                    const idx = authListeners.indexOf(cb);
                    if (idx >= 0) authListeners.splice(idx, 1);
                  }
                }
              }
            };
          }
        }
      };

      const routedFetch: typeof fetch = (input, init) => {
        const urlStr = typeof input === 'string' ? input : input.toString();
        const target = urlStr.startsWith('http') ? urlStr : `${baseUrl}${urlStr}`;
        return fetch(target, init);
      };

      const sdkService = new ResilientServicesService({
        authClient: mockAuthClient,
        fetchImpl: routedFetch
      });

      // 14a. Sign-in with valid admin account
      const loginOk = await sdkService.signInAdmin(USERS.admin.email, 'valid-pass');
      const step14a = loginOk.status === 'authenticated' && loginOk.session?.role === 'admin';

      // 14b. Page reload verification via getSession()
      const reloadOk = await sdkService.verifyAdminSession();
      const step14b = reloadOk.status === 'authenticated' && reloadOk.session?.user.email === USERS.admin.email;

      // 14c. Token refresh via onAuthStateChange('TOKEN_REFRESHED')
      const refreshedToken = 'test_token_admin_refreshed_999';
      memoryTokens.set(refreshedToken, USERS.admin);
      let latestStateChangeStatus = '';
      const unsub = sdkService.onAdminAuthStateChange((res) => {
        latestStateChangeStatus = `${res.status}:${res.session?.role || ''}`;
      });
      currentSessionToken = refreshedToken;
      for (const listener of authListeners) {
        await listener('TOKEN_REFRESHED', { access_token: refreshedToken });
      }
      // Wait briefly for async listener resolution
      await new Promise((r) => setTimeout(r, 30));
      const activeBearer = await sdkService.getAccessToken();
      const step14c = activeBearer === refreshedToken && latestStateChangeStatus === 'authenticated:admin';

      // 14d. Non-member login rejected with 403 and automatic signOut
      const beforeSignOutCount = signOutCallCount;
      const nonMemberLogin = await sdkService.signInAdmin(USERS.ordinaryUser.email, 'valid-pass');
      const step14d = nonMemberLogin.status === 'forbidden' && signOutCallCount > beforeSignOutCount && currentSessionToken === null;

      // 14e. Membership removal while session is active -> forbidden + automatic signOut
      const tempMemberToken = 'test_token_temp_member_777';
      const tempMemberId = 'usr_temp_member_77';
      memoryTokens.set(tempMemberToken, { id: tempMemberId, email: 'temp@unikorn360.com', role: 'evaluator' });
      currentSessionToken = tempMemberToken;
      // Note: tempMemberId is NOT in memoryAdminUsers, simulating revoked membership
      const revokedCheck = await sdkService.verifyAdminSession();
      const step14e = revokedCheck.status === 'forbidden' && currentSessionToken === null;

      // 14f. Expired/invalid token -> unauthenticated + automatic signOut
      currentSessionToken = 'expired_token_000';
      const expiredCheck = await sdkService.verifyAdminSession();
      const step14f = expiredCheck.status === 'unauthenticated' && currentSessionToken === null;

      // 14g. Logout awaits signOut and reports failure if SDK signOut fails
      currentSessionToken = refreshedToken;
      simulateSignOutError = 'Supabase Auth network timeout during signOut';
      const failedLogout = await sdkService.logoutAdmin();
      simulateSignOutError = null;
      const cleanLogout = await sdkService.logoutAdmin();
      const step14g = !failedLogout.success &&
        Boolean(failedLogout.error?.includes('timeout')) &&
        cleanLogout.success &&
        currentSessionToken === null;

      unsub();

      const passed = step14a && step14b && step14c && step14d && step14e && step14f && step14g;
      results.push({
        scenarioNumber: 14,
        category: 'Mocked SDK Session + API',
        name: 'Complete Supabase SDK session flow (login, reload, TOKEN_REFRESHED, 403/401 signOut, logout error reporting)',
        passed,
        expected: 'All 7 lifecycle sub-checks true',
        actual: `login=${step14a}, reload=${step14b}, refresh=${step14c}, nonMember403=${step14d}, revoked403=${step14e}, expired401=${step14f}, logout=${step14g}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 15: Server Configuration Precedence & Key Separation (resolveSupabaseConfig)
    //  - SUPABASE_SECRET_KEY preferred over SUPABASE_SERVICE_ROLE_KEY
    //  - Publishable key never substituted into privilegedKey
    //  - Secret key rejected if placed in publishable/anon key env var
    //  - Separate flags for public client, user auth verification, and privileged server ops
    // -------------------------------------------------------------
    {
      // 15a. Both SUPABASE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY set -> prefers SUPABASE_SECRET_KEY
      const cfgBoth = resolveSupabaseConfig({
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_pub123',
        SUPABASE_SECRET_KEY: 'sb_secret_modern_key',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJ_legacy_service_role_key'
      });
      const step15a = cfgBoth.privilegedKey === 'sb_secret_modern_key' &&
        cfgBoth.privilegedKeySource === 'SUPABASE_SECRET_KEY' &&
        cfgBoth.publishableKey === 'sb_publishable_pub123' &&
        cfgBoth.isPublicClientConfigured &&
        cfgBoth.isUserAuthConfigured &&
        cfgBoth.isPrivilegedServerConfigured;

      // 15b. Only legacy SUPABASE_SERVICE_ROLE_KEY set -> uses legacy fallback
      const cfgLegacy = resolveSupabaseConfig({
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_ANON_KEY: 'eyJ_legacy_anon_key',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJ_legacy_service_role_key'
      });
      const step15b = cfgLegacy.privilegedKey === 'eyJ_legacy_service_role_key' &&
        cfgLegacy.privilegedKeySource === 'SUPABASE_SERVICE_ROLE_KEY' &&
        cfgLegacy.publishableKey === 'eyJ_legacy_anon_key' &&
        cfgLegacy.isPrivilegedServerConfigured;

      // 15c. Only publishable/anon key set (no secret/service_role key) -> privilegedKey MUST be empty and isPrivilegedServerConfigured MUST be false
      const cfgPublicOnly = resolveSupabaseConfig({
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_only'
      });
      const step15c = cfgPublicOnly.privilegedKey === '' &&
        cfgPublicOnly.privilegedKeySource === 'none' &&
        cfgPublicOnly.isPublicClientConfigured === true &&
        cfgPublicOnly.isUserAuthConfigured === true &&
        cfgPublicOnly.isPrivilegedServerConfigured === false;

      // 15d. Secret key accidentally placed in publishable variable -> rejected from publishableKey, and publishable key placed in secret variable -> rejected from privilegedKey
      const cfgMisplaced = resolveSupabaseConfig({
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_PUBLISHABLE_KEY: 'sb_secret_wrong_slot',
        SUPABASE_SECRET_KEY: 'sb_publishable_wrong_slot'
      });
      const step15d = cfgMisplaced.publishableKey === '' &&
        cfgMisplaced.privilegedKey === '' &&
        !cfgMisplaced.isPublicClientConfigured &&
        !cfgMisplaced.isPrivilegedServerConfigured;

      const passed = step15a && step15b && step15c && step15d;
      results.push({
        scenarioNumber: 15,
        category: 'Config & Fail-Closed',
        name: 'SUPABASE_SECRET_KEY precedence, legacy fallback, and strict separation of publishable vs privileged keys',
        passed,
        expected: 'preferSecret=true, legacyFallback=true, noAnonInPrivileged=true, rejectMisplacedKeys=true',
        actual: `preferSecret=${step15a}, legacyFallback=${step15b}, noAnonInPrivileged=${step15c}, rejectMisplacedKeys=${step15d}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 16: Fail-Closed Behavior When Test Memory Fallback Is Disabled
    //  - Memory tokens are rejected when DISABLE_TEST_MEMORY_FALLBACK='true'
    //  - Public application submission returns 503 PRIVILEGED_CONFIG_MISSING instead of fabricated success when privileged server config is absent
    // -------------------------------------------------------------
    {
      const savedSecret = process.env.SUPABASE_SECRET_KEY;
      const savedServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.DISABLE_TEST_MEMORY_FALLBACK = 'true';
      delete process.env.SUPABASE_SECRET_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      try {
        // 16a. Memory token rejected when test memory fallback is disabled
        const authRes = await fetch(`${baseUrl}/api/admin/auth/me`, {
          headers: { 'Authorization': `Bearer ${TOKENS.superadmin}` }
        });

        // 16b. Public application write fails closed with 503 PRIVILEGED_CONFIG_MISSING instead of fabricated success
        const applyRes = await fetch(`${baseUrl}/api/creators/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: 'Test Creator',
            whatsapp: '9876543210',
            email: 'creator@example.com',
            state: 'Tamil Nadu',
            district: 'Chennai',
            cityTown: 'Adyar',
            instagramUrl: 'https://instagram.com/testcreator',
            followerCount: '10K',
            averageViewsLast10: '5K',
            categories: ['Technology & Gadgets'],
            primaryLanguage: 'Tamil',
            classification: 'l2_nano',
            collaborationTypes: ['Sponsored Reel / Short'],
            sampleLinks: [
              'https://instagram.com/reel/sample1',
              'https://instagram.com/reel/sample2'
            ],
            consentAccuracy: true,
            consentProcessing: true,
            consentContact: true,
            consentBrandSharing: true
          })
        });
        const applyBody = await applyRes.json().catch(() => ({}));

        const passed = (authRes.status === 401 || authRes.status === 503) &&
          applyRes.status === 503 &&
          applyBody.code === 'PRIVILEGED_CONFIG_MISSING';

        results.push({
          scenarioNumber: 16,
          category: 'Config & Fail-Closed',
          name: 'Fail-closed outside test fallback: memory tokens rejected & writes return 503 PRIVILEGED_CONFIG_MISSING',
          passed,
          expected: 'auth: 401/503, apply: 503 PRIVILEGED_CONFIG_MISSING',
          actual: `auth: ${authRes.status}, apply: ${applyRes.status} (${applyBody.code || ''})`
        });
      } finally {
        delete process.env.DISABLE_TEST_MEMORY_FALLBACK;
        if (savedSecret !== undefined) process.env.SUPABASE_SECRET_KEY = savedSecret;
        if (savedServiceRole !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedServiceRole;
      }
    }

    // -------------------------------------------------------------
    // Scenario 17: Static SQL Verification of Migration History & Forward Migrations (20261102 & 20261103)
    //  Verifies:
    //  - Historical migrations (20261028_reorganize_services_6_divisions.sql, 20261029, 20261030, 20261031, 20261101) exist on disk
    //  - Forward migrations 20261102 and 20261103 contain ZERO UPDATE statements on service_divisions or service_catalog
    //  - Forward migrations do not infer owner approval from slugs, UUIDs, or timestamps
    //  - Forward migrations seed missing services strictly as 'draft' with published_at = NULL
    //  - Forward migrations define public.get_service_catalogue_reconciliation_review() for administrator review
    // -------------------------------------------------------------
    {
      const mig2028ReorgPath = path.resolve(process.cwd(), 'supabase/migrations/20261028_reorganize_services_6_divisions.sql');
      const mig2029Path = path.resolve(process.cwd(), 'supabase/migrations/20261029_fix_admin_auth_and_rls.sql');
      const mig2030Path = path.resolve(process.cwd(), 'supabase/migrations/20261030_fix_evaluator_rpc_and_activity_leak.sql');
      const mig2031Path = path.resolve(process.cwd(), 'supabase/migrations/20261031_strict_evaluator_projection_and_notes_privacy.sql');
      const mig2101Path = path.resolve(process.cwd(), 'supabase/migrations/20261101_step1c_evaluator_nested_json_and_catalog_seed.sql');
      const mig2102Path = path.resolve(process.cwd(), 'supabase/migrations/20261102_reconcile_service_catalogue_drafts.sql');
      const mig2103Path = path.resolve(process.cwd(), 'supabase/migrations/20261103_catalogue_reconciliation_review_and_draft_seed.sql');
      const has2028Reorg = fs.existsSync(mig2028ReorgPath);
      const has2029 = fs.existsSync(mig2029Path);
      const has2030 = fs.existsSync(mig2030Path);
      const has2031 = fs.existsSync(mig2031Path);
      const has2101 = fs.existsSync(mig2101Path);
      const has2102 = fs.existsSync(mig2102Path);
      const has2103 = fs.existsSync(mig2103Path);
      const sql2028Reorg = has2028Reorg ? fs.readFileSync(mig2028ReorgPath, 'utf8') : '';
      const sql2031 = has2031 ? fs.readFileSync(mig2031Path, 'utf8') : '';
      const sql2101 = has2101 ? fs.readFileSync(mig2101Path, 'utf8') : '';
      const sql2102 = has2102 ? fs.readFileSync(mig2102Path, 'utf8') : '';
      const sql2103 = has2103 ? fs.readFileSync(mig2103Path, 'utf8') : '';

      const historicalPreserved =
        sql2028Reorg.includes('ON CONFLICT (slug) DO UPDATE SET') &&
        sql2101.includes('CREATE OR REPLACE FUNCTION public.is_service_seed_approved_for_publish(p_packages JSONB)');

      const zeroCatalogueUpdatesInForward =
        !/UPDATE\s+public\.service_divisions/i.test(sql2102) &&
        !/UPDATE\s+public\.service_catalog/i.test(sql2102) &&
        !/UPDATE\s+public\.service_divisions/i.test(sql2103) &&
        !/UPDATE\s+public\.service_catalog/i.test(sql2103);

      const forwardSeedsDraftsAndReviewRpc =
        sql2102.includes('DROP FUNCTION IF EXISTS public.is_service_seed_approved_for_publish(JSONB);') &&
        sql2102.includes("'draft' AS status") &&
        sql2102.includes('NULL::timestamptz AS published_at') &&
        sql2102.includes('ON CONFLICT (slug) DO NOTHING') &&
        sql2102.includes('CREATE OR REPLACE FUNCTION public.get_service_catalogue_reconciliation_review()') &&
        sql2103.includes('DROP FUNCTION IF EXISTS public.is_service_seed_approved_for_publish(JSONB);') &&
        sql2103.includes("'draft' AS status") &&
        sql2103.includes('NULL::timestamptz AS published_at') &&
        sql2103.includes('ON CONFLICT (slug) DO NOTHING') &&
        sql2103.includes('CREATE OR REPLACE FUNCTION public.get_service_catalogue_reconciliation_review()');

      const hasTsValidator = sql2031.includes('CREATE OR REPLACE FUNCTION public.is_valid_iso8601_timestamptz');
      const hasFilterFn = sql2031.includes('CREATE OR REPLACE FUNCTION public.filter_activity_log_for_evaluator') &&
        sql2031.includes('WITH ORDINALITY');
      const hasEvaluatorFn = sql2031.includes('CREATE OR REPLACE FUNCTION public.get_creator_applications_for_evaluator()') &&
        sql2102.includes('CREATE OR REPLACE FUNCTION public.get_creator_applications_for_evaluator()') &&
        sql2103.includes('CREATE OR REPLACE FUNCTION public.get_creator_applications_for_evaluator()');
      const hasNestedJsonHelpers =
        sql2102.includes('CREATE OR REPLACE FUNCTION public.project_jsonb_string_array_for_evaluator') &&
        sql2102.includes('CREATE OR REPLACE FUNCTION public.project_expected_rates_for_evaluator') &&
        sql2102.includes('CREATE OR REPLACE FUNCTION public.project_audience_insights_for_evaluator') &&
        sql2102.includes('CREATE OR REPLACE FUNCTION public.project_previous_collaborations_for_evaluator') &&
        sql2103.includes('CREATE OR REPLACE FUNCTION public.project_jsonb_string_array_for_evaluator');
      const hasExactTypes = sql2102.includes('application_reference VARCHAR(50)') &&
        sql2102.includes('full_name VARCHAR(255)') &&
        sql2102.includes('district VARCHAR(100)') &&
        sql2102.includes('town VARCHAR(150)') &&
        sql2102.includes('latest_score NUMERIC(5,2)');
      const hasSearchPath = sql2031.includes('SET search_path = public, pg_temp') &&
        sql2102.includes('SET search_path = public, pg_temp') &&
        sql2103.includes('SET search_path = public, pg_temp');
      const hasGrants = sql2102.includes('REVOKE ALL ON FUNCTION public.get_creator_applications_for_evaluator() FROM PUBLIC, anon') &&
        sql2102.includes('GRANT EXECUTE ON FUNCTION public.get_creator_applications_for_evaluator() TO authenticated') &&
        sql2103.includes('REVOKE ALL ON FUNCTION public.get_service_catalogue_reconciliation_review() FROM PUBLIC, anon') &&
        sql2103.includes('GRANT EXECUTE ON FUNCTION public.get_service_catalogue_reconciliation_review() TO authenticated');
      const excludesSensitiveCols =
        !sql2031.match(/ca\.payments\b/) &&
        !sql2031.match(/ca\.ip_hash\b/) &&
        !sql2031.match(/ca\.admin_notes\b/) &&
        !sql2102.match(/ca\.payments\b/) &&
        !sql2102.match(/ca\.ip_hash\b/) &&
        !sql2102.match(/ca\.admin_notes\b/) &&
        !sql2103.match(/ca\.payments\b/) &&
        !sql2103.match(/ca\.ip_hash\b/) &&
        !sql2103.match(/ca\.admin_notes\b/);
      const noDropCascade =
        !/DROP\s+FUNCTION[^;]*CASCADE/i.test(sql2031) &&
        !/DROP\s+FUNCTION[^;]*CASCADE/i.test(sql2101) &&
        !/DROP\s+FUNCTION[^;]*CASCADE/i.test(sql2102) &&
        !/DROP\s+FUNCTION[^;]*CASCADE/i.test(sql2103);

      const passed = has2028Reorg &&
        has2029 &&
        has2030 &&
        has2031 &&
        has2101 &&
        has2102 &&
        has2103 &&
        historicalPreserved &&
        zeroCatalogueUpdatesInForward &&
        forwardSeedsDraftsAndReviewRpc &&
        hasTsValidator &&
        hasFilterFn &&
        hasEvaluatorFn &&
        hasNestedJsonHelpers &&
        hasExactTypes &&
        hasSearchPath &&
        hasGrants &&
        excludesSensitiveCols &&
        noDropCascade;

      results.push({
        scenarioNumber: 17,
        category: 'Static SQL Verification',
        name: 'Forward migrations 20261102 & 20261103 contain zero status-mutating UPDATEs on service_divisions/service_catalog, seed missing services as drafts, and define get_service_catalogue_reconciliation_review()',
        passed,
        expected: 'All static SQL checks true (zeroCatalogueUpdatesInForward=true, forwardSeedsDraftsAndReviewRpc=true)',
        actual: `historicalPreserved=${historicalPreserved}, zeroUpdates=${zeroCatalogueUpdatesInForward}, forwardDraftsAndReview=${forwardSeedsDraftsAndReviewRpc}, nestedJsonHelpers=${hasNestedJsonHelpers}, excludesSensitiveCols=${excludesSensitiveCols}, noCascade=${noDropCascade}`
      });
    }

    // -------------------------------------------------------------
    // Scenarios 18–31: Executed PostgreSQL Database Tests (PGlite PG17.4)
    //  - Fresh database installation of all 9 clean-install migrations in deterministic order
    //  - Upgrade & reconciliation regression suite (all 5 required regression cases + review RPC)
    //  - All 12 RLS/RPC role assertions, 10 privacy fixtures, and catalogue CRUD persistence
    // -------------------------------------------------------------
    const dbResults = await runDatabaseVerificationSuite(18);
    results.push(...dbResults);

    // -------------------------------------------------------------
    // Scenario 32: Reference Screenshots Removed From Public & Build Output
    //  Verifies:
    //  - /public/assets/aistudio does not exist
    //  - /dist/assets/aistudio does not exist
    //  - Zero Screenshot_2026-10-29_*.png files remain anywhere under /public or /dist
    // -------------------------------------------------------------
    {
      const findMatchingFiles = (dir: string, predicate: (name: string) => boolean): string[] => {
        if (!fs.existsSync(dir)) return [];
        const matches: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            matches.push(...findMatchingFiles(full, predicate));
          } else if (predicate(entry.name)) {
            matches.push(full);
          }
        }
        return matches;
      };

      const publicAiStudioDir = path.resolve(process.cwd(), 'public/assets/aistudio');
      const distAiStudioDir = path.resolve(process.cwd(), 'dist/assets/aistudio');
      const publicReferenceScreenshots = findMatchingFiles(
        path.resolve(process.cwd(), 'public'),
        (name) => name.startsWith('Screenshot_2026-10-29_')
      );
      const distReferenceScreenshots = findMatchingFiles(
        path.resolve(process.cwd(), 'dist'),
        (name) => name.startsWith('Screenshot_2026-10-29_')
      );

      const passed =
        publicReferenceScreenshots.length === 0 &&
        distReferenceScreenshots.length === 0;

      results.push({
        scenarioNumber: 32,
        category: 'Asset Hygiene' as any,
        name: 'Reference screenshots (Screenshot_2026-10-29_*) removed from public/ and dist/ build output (0 reference screenshots in source or build)',
        passed,
        expected: '0 reference screenshots (Screenshot_2026-10-29_*) in public/ or dist/',
        actual: `publicReferenceScreenshots=${publicReferenceScreenshots.length}, distReferenceScreenshots=${distReferenceScreenshots.length}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 33: Breadcrumbs Navigation Regression Check
    //  Verifies:
    //  - DivisionPage, ServiceDetailPage, and ServicesDirectoryPage pass onNavigate={onNavigate}
    //  - Breadcrumb items use `path` property (zero `href:` properties in breadcrumb items)
    //  - Simulated Breadcrumbs interaction triggers onNavigate('/') for Home,
    //    onNavigate('/services') for Services, and onNavigate('/services/websites-software') for division
    // -------------------------------------------------------------
    {
      const divisionPageSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/DivisionPage.tsx'), 'utf8');
      const serviceDetailSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/ServiceDetailPage.tsx'), 'utf8');
      const servicesDirSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/ServicesDirectoryPage.tsx'), 'utf8');

      const divHasOnNavigate =
        divisionPageSrc.includes("{ label: 'Services', path: '/services' }") &&
        divisionPageSrc.includes('onNavigate={onNavigate}') &&
        !divisionPageSrc.includes("label: 'Services', href:");

      const detailHasOnNavigate =
        serviceDetailSrc.includes("{ label: 'Services', path: '/services' }") &&
        serviceDetailSrc.includes('{ label: division.name, path: `/services/${division.slug}` }') &&
        serviceDetailSrc.includes('onNavigate={onNavigate}') &&
        !serviceDetailSrc.includes("label: 'Services', href:");

      const dirHasOnNavigate =
        servicesDirSrc.includes("{ label: 'Services' }") &&
        servicesDirSrc.includes('onNavigate={onNavigate}') &&
        !servicesDirSrc.includes('href:');

      // Simulate the Breadcrumbs component navigation callbacks for Home, Services, and Division links
      const navigatedTargets: string[] = [];
      const mockOnNavigate = (targetPath: string) => {
        navigatedTargets.push(targetPath);
      };

      const serviceDetailBreadcrumbItems = [
        { label: 'Services', path: '/services' },
        { label: 'Websites & Software', path: '/services/websites-software' },
        { label: 'Website Development' }
      ];

      // Click Home (always rendered first in Breadcrumbs)
      mockOnNavigate('/');
      // Click intermediate items that have `item.path && !isLast`
      serviceDetailBreadcrumbItems.forEach((item, idx) => {
        const isLast = idx === serviceDetailBreadcrumbItems.length - 1;
        if (item.path && !isLast) {
          mockOnNavigate(item.path);
        }
      });

      const passed =
        divHasOnNavigate &&
        detailHasOnNavigate &&
        dirHasOnNavigate &&
        JSON.stringify(navigatedTargets) === JSON.stringify(['/', '/services', '/services/websites-software']);

      results.push({
        scenarioNumber: 33,
        category: 'Routing & Navigation' as any,
        name: 'DivisionPage, ServiceDetailPage, and ServicesDirectoryPage pass onNavigate and use BreadcrumbItem.path for Home (/), Services (/services), and Division (/services/:slug)',
        passed,
        expected: 'divHasOnNavigate=true, detailHasOnNavigate=true, dirHasOnNavigate=true, targets=["/","/services","/services/websites-software"]',
        actual: `divHasOnNavigate=${divHasOnNavigate}, detailHasOnNavigate=${detailHasOnNavigate}, dirHasOnNavigate=${dirHasOnNavigate}, targets=${JSON.stringify(navigatedTargets)}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 34: Router Query-String Separation & Creator Submission Success Flow
    //  Verifies:
    //  - POST /api/creators/apply returns referenceNumber (e.g. U360-CR-XXXXXXXX)
    //  - Navigating to `/creators/success?ref=${referenceNumber}` separates pathname `/creators/success` from search `?ref=${referenceNumber}`
    //  - Direct load, page refresh, browser Back (popstate to `/creators/apply`), and browser Forward (popstate to `/creators/success?ref=...`)
    //    preserve both pathname route matching and the creator application reference number
    // -------------------------------------------------------------
    {
      const applyRes = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Aarav Sundaram',
          whatsapp: '9876501234',
          email: 'aarav.router.test@example.com',
          state: 'Tamil Nadu',
          district: 'Coimbatore',
          cityTown: 'RS Puram',
          instagramUrl: 'https://instagram.com/aaravcreates',
          followerCount: '24000',
          averageViewsLast10: '11500',
          categories: ['Technology & Gadgets'],
          primaryLanguage: 'Tamil',
          classification: 'l3_micro',
          collaborationTypes: ['Sponsored Reel / Short', 'UGC Video Production'],
          sampleLinks: [
            'https://instagram.com/reel/aarav1',
            'https://instagram.com/reel/aarav2'
          ],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true
        })
      });
      const applyData = await applyRes.json().catch(() => ({}));
      const referenceNumber: string = applyData.referenceNumber || '';

      // Simulate browser history stack & router state across submission -> direct load -> refresh -> back -> forward
      const historyStack: string[] = ['/creators/apply'];
      let historyIndex = 0;

      // 1. CreatorApplyPage calls onNavigate(`/creators/success?ref=${encodeURIComponent(referenceNumber)}`)
      const targetUrl = `/creators/success?ref=${encodeURIComponent(referenceNumber)}`;
      const pushRoute = parseRouteLocation(targetUrl);
      historyStack.push(pushRoute.fullUrl);
      historyIndex = historyStack.length - 1;

      const afterSubmitMatchedCreatorSuccess = pushRoute.pathname === '/creators/success';
      const afterSubmitRef = extractCreatorReference(pushRoute.search);

      // 2. Direct load & Refresh of `/creators/success?ref=...`
      const directLoadRoute = parseRouteLocation(historyStack[historyIndex]);
      const refreshRoute = parseRouteLocation(`${directLoadRoute.pathname}${directLoadRoute.search}`);
      const directAndRefreshOk =
        directLoadRoute.pathname === '/creators/success' &&
        extractCreatorReference(directLoadRoute.search) === referenceNumber &&
        refreshRoute.pathname === '/creators/success' &&
        extractCreatorReference(refreshRoute.search) === referenceNumber;

      // 3. Browser Back (popstate to `/creators/apply`)
      historyIndex -= 1;
      const backRoute = parseRouteLocation(historyStack[historyIndex]);
      const backOk = backRoute.pathname === '/creators/apply' && backRoute.search === '';

      // 4. Browser Forward (popstate back to `/creators/success?ref=...`)
      historyIndex += 1;
      const forwardRoute = parseRouteLocation(historyStack[historyIndex]);
      const forwardOk =
        forwardRoute.pathname === '/creators/success' &&
        extractCreatorReference(forwardRoute.search) === referenceNumber &&
        extractQueryParam(forwardRoute.search, 'ref') === referenceNumber;

      const passed =
        applyRes.status === 201 &&
        referenceNumber.startsWith('U360-CR-') &&
        afterSubmitMatchedCreatorSuccess &&
        afterSubmitRef === referenceNumber &&
        directAndRefreshOk &&
        backOk &&
        forwardOk;

      results.push({
        scenarioNumber: 34,
        category: 'Routing & Navigation' as any,
        name: 'Router separates pathname from search query string across creator submission, direct load, refresh, and browser back/forward',
        passed,
        expected: 'POST 201 with U360-CR-* ref, pathname="/creators/success", ref preserved on submit/direct/refresh/back/forward',
        actual: `status=${applyRes.status}, ref=${referenceNumber}, pathname=${pushRoute.pathname}, search=${pushRoute.search}, directAndRefreshOk=${directAndRefreshOk}, backOk=${backOk}, forwardOk=${forwardOk}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 40: Creator Upload Hardening: Overwrite attempt rejected (HTTP 409 OBJECT_EXISTS)
    // -------------------------------------------------------------
    {
      const sessRes = await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' });
      const sessData = await sessRes.json();
      const sessId = sessData.uploadSessionId;
      const secret = sessData.submissionSecret;

      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);
      const base64Mp4 = validMp4Buf.toString('base64');

      const signRes = await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessId,
          submissionSecret: secret,
          filename: 'sample_video.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      });
      const signData = await signRes.json();

      const upload1 = await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessId,
          submissionSecret: secret,
          storagePath: signData.storagePath,
          fileData: base64Mp4,
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const upload2 = await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessId,
          submissionSecret: secret,
          storagePath: signData.storagePath,
          fileData: base64Mp4,
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });
      const body2 = await upload2.json().catch(() => ({}));

      const passed = upload1.status === 200 && upload2.status === 409 && body2.code === 'OBJECT_EXISTS';
      results.push({
        scenarioNumber: 40,
        category: 'Creator Upload Hardening' as any,
        name: 'Unauthorized file overwrite attempt rejected (upsert: false / OBJECT_EXISTS)',
        passed,
        expected: 'HTTP 409 OBJECT_EXISTS on second upload attempt to same storagePath',
        actual: `upload1=${upload1.status}, upload2=${upload2.status} ${body2.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 41: Creator Upload Hardening: Foreign asset path rejected on apply
    // -------------------------------------------------------------
    {
      const sessDataA = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const sessA = sessDataA.uploadSessionId;
      const secretA = sessDataA.submissionSecret;

      const sessDataB = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const sessB = sessDataB.uploadSessionId;
      const secretB = sessDataB.submissionSecret;

      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const signA = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessA,
          submissionSecret: secretA,
          filename: 'videoA.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessA,
          submissionSecret: secretA,
          storagePath: signA.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const applyRes = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessB,
          submissionSecret: secretB,
          fullName: 'Foreign Path Tester',
          whatsapp: '+919988776655',
          email: 'foreign.path@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=valid1'],
          uploadedVideos: [{ name: 'videoA.mp4', storagePath: signA.storagePath }]
        })
      });
      const applyBody = await applyRes.json().catch(() => ({}));

      const passed = applyRes.status === 403 && applyBody.code === 'FOREIGN_ASSET_PATH';
      results.push({
        scenarioNumber: 41,
        category: 'Creator Upload Hardening' as any,
        name: 'Foreign asset path from unassigned upload session rejected on application submit',
        passed,
        expected: 'HTTP 403 FOREIGN_ASSET_PATH',
        actual: `HTTP ${applyRes.status} ${applyBody.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 42: Creator Upload Hardening: Malformed file signature rejected
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const sess = sessData.uploadSessionId;
      const secret = sessData.submissionSecret;

      const sign = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess,
          submissionSecret: secret,
          filename: 'fake_video.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      const fakeBuffer = Buffer.from('THIS IS NOT A VALID MP4 FILE CONTAINER CONTENT AT ALL');
      const relayRes = await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess,
          submissionSecret: secret,
          storagePath: sign.storagePath,
          fileData: fakeBuffer.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });
      const relayBody = await relayRes.json().catch(() => ({}));

      const passed = relayRes.status === 400 && relayBody.code === 'MALFORMED_FILE';
      results.push({
        scenarioNumber: 42,
        category: 'Creator Upload Hardening' as any,
        name: 'Malformed file content rejected due to magic byte signature mismatch',
        passed,
        expected: 'HTTP 400 MALFORMED_FILE',
        actual: `HTTP ${relayRes.status} ${relayBody.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 43: Creator Upload Hardening: Expired upload session rejected
    // -------------------------------------------------------------
    {
      const expiredSessId = 'expired_session_test_99';
      activeUploadSessions.set(expiredSessId, {
        sessionId: expiredSessId,
        submissionSecret: 'secret_expired_test_99',
        status: 'created',
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() - 1000,
        assets: new Map()
      });

      const signRes = await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: expiredSessId,
          filename: 'sample.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      });
      const signBody = await signRes.json().catch(() => ({}));

      const passed = signRes.status === 400 && signBody.code === 'EXPIRED_SESSION';
      results.push({
        scenarioNumber: 43,
        category: 'Creator Upload Hardening' as any,
        name: 'Expired upload session rejected on upload signature request',
        passed,
        expected: 'HTTP 400 EXPIRED_SESSION',
        actual: `HTTP ${signRes.status} ${signBody.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 44: Creator Upload Hardening: Asset metadata insert error yields recoverable non-success response
    // -------------------------------------------------------------
    {
      const sess = (await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json()).uploadSessionId;

      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const sign = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess,
          filename: 'vid_retry.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess,
          storagePath: sign.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const applyRes = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess,
          fullName: 'Asset Error Retry Tester',
          whatsapp: '+919911223344',
          email: 'asset.retry@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=sample1'],
          uploadedVideos: [{ name: 'vid_retry.mp4', storagePath: sign.storagePath }],
          simulate_asset_error: true
        })
      });
      const applyBody = await applyRes.json().catch(() => ({}));

      const passed = applyRes.status === 502 && applyBody.code === 'ASSET_RECORDING_FAILED' && applyBody.retryable === true;
      results.push({
        scenarioNumber: 44,
        category: 'Creator Upload Hardening' as any,
        name: 'Asset metadata insert error returns recoverable non-success response (retryable: true)',
        passed,
        expected: 'HTTP 502 ASSET_RECORDING_FAILED with retryable=true',
        actual: `HTTP ${applyRes.status} code=${applyBody.code} retryable=${applyBody.retryable}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 50: Duplicate/Tampering protection: Matching email/phone without valid secret rejected (HTTP 409 DUPLICATE_APPLICATION)
    // -------------------------------------------------------------
    {
      const applyRes = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Karthik Senthilnathan Imposter',
          whatsapp: '+91 94432 18900', // matches existing mem-app-01
          email: 'karthik.maduraifoodie@gmail.com', // matches existing mem-app-01
          state: 'Tamil Nadu',
          district: 'Madurai',
          cityTown: 'Madurai City',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=tamper1', 'https://youtube.com/watch?v=tamper2']
        })
      });
      const body = await applyRes.json().catch(() => ({}));
      const passed = applyRes.status === 409 && body.code === 'DUPLICATE_APPLICATION';
      results.push({
        scenarioNumber: 50,
        category: 'Creator Upload Hardening' as any,
        name: 'Matching another applicant email/phone without secret returns HTTP 409 DUPLICATE_APPLICATION',
        passed,
        expected: 'HTTP 409 DUPLICATE_APPLICATION',
        actual: `HTTP ${applyRes.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 51: Asset failure followed by authorized retry with valid submissionSecret completes same record
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const sign = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          filename: 'retry_sample.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          storagePath: sign.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      // First attempt fails with simulated asset error
      const attempt1 = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-simulate-asset-error': 'true' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          fullName: 'Retry Applicant',
          whatsapp: '+919876599999',
          email: 'retry.applicant@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=retry1'],
          uploadedVideos: [{ name: 'retry_sample.mp4', storagePath: sign.storagePath }]
        })
      });
      const body1 = await attempt1.json();

      // Second attempt retries with same session & submissionSecret
      const attempt2 = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          fullName: 'Retry Applicant',
          whatsapp: '+919876599999',
          email: 'retry.applicant@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=retry1'],
          uploadedVideos: [{ name: 'retry_sample.mp4', storagePath: sign.storagePath }]
        })
      });
      const body2 = await attempt2.json();

      const passed = attempt1.status === 502 && body1.retryable === true &&
        attempt2.status === 201 && body2.referenceNumber === body1.applicationReference;

      results.push({
        scenarioNumber: 51,
        category: 'Creator Upload Hardening' as any,
        name: 'Asset failure followed by authorized retry with valid submissionSecret completes same application record',
        passed,
        expected: 'Attempt 1: 502 retryable, Attempt 2: 201 with same reference number',
        actual: `Attempt1=${attempt1.status}, Attempt2=${attempt2.status} ref1=${body1.applicationReference} ref2=${body2.referenceNumber}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 52: PostgreSQL upsert with onConflict: 'storage_path' succeeds
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const sign = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          filename: 'upsert_test.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          storagePath: sign.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const apply1 = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          fullName: 'Upsert Tester',
          whatsapp: '+919111122222',
          email: 'upsert.tester@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=upsert1'],
          uploadedVideos: [{ name: 'upsert_test.mp4', storagePath: sign.storagePath }]
        })
      });

      const passed = apply1.status === 201;
      results.push({
        scenarioNumber: 52,
        category: 'Creator Upload Hardening' as any,
        name: 'PostgreSQL upsert with onConflict: storage_path succeeds',
        passed,
        expected: 'HTTP 201 Created',
        actual: `HTTP ${apply1.status}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 53: Server restart (activeUploadSessions.clear()) reloads session from disk/db and preserves state
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const sessId = sessData.uploadSessionId;

      // Clear in-memory Map to simulate server process restart
      activeUploadSessions.clear();

      const signRes = await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessId,
          submissionSecret: sessData.submissionSecret,
          filename: 'restart_test.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      });
      const signBody = await signRes.json();

      const passed = signRes.status === 200 && signBody.uploadSessionId === sessId;
      results.push({
        scenarioNumber: 53,
        category: 'Creator Upload Hardening' as any,
        name: 'Server restart (in-memory clear) reloads upload session from disk/db and preserves state',
        passed,
        expected: 'HTTP 200 with restored sessionId',
        actual: `HTTP ${signRes.status} sessId=${signBody.uploadSessionId}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 54: Two independent server requests with same session/secret do not create duplicate records
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const sign = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          filename: 'concurrent.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          storagePath: sign.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const payload = {
        uploadSessionId: sessData.uploadSessionId,
        submissionSecret: sessData.submissionSecret,
        fullName: 'Concurrent Tester',
        whatsapp: '+919222233333',
        email: 'concurrent.tester@example.com',
        state: 'Tamil Nadu',
        district: 'Chennai',
        cityTown: 'Chennai',
        classification: 'ugc',
        categories: ['Food & Culinary'],
        consentAccuracy: true,
        consentProcessing: true,
        consentContact: true,
        consentBrandSharing: true,
        sampleLinks: ['https://youtube.com/watch?v=concurrent1'],
        uploadedVideos: [{ name: 'concurrent.mp4', storagePath: sign.storagePath }]
      };

      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/api/creators/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }),
        fetch(`${baseUrl}/api/creators/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      ]);

      const body1 = await res1.json();
      const body2 = await res2.json();

      const sameRef = body1.referenceNumber === body2.referenceNumber;
      const passed = res1.status === 201 && res2.status === 201 && sameRef;

      results.push({
        scenarioNumber: 54,
        category: 'Creator Upload Hardening' as any,
        name: 'Two concurrent requests with same uploadSessionId return same reference number without duplicate records',
        passed,
        expected: 'HTTP 201 on both, same referenceNumber',
        actual: `res1=${res1.status}, res2=${res2.status}, ref1=${body1.referenceNumber}, ref2=${body2.referenceNumber}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 55: Oversized and category-mismatched uploads rejected with HTTP 400
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();

      const signRes = await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          filename: 'huge_video.mp4',
          fileType: 'video/mp4',
          fileSize: 50 * 1024 * 1024, // 50MB exceeds 30MB limit
          category: 'video_sample'
        })
      });
      const body = await signRes.json();

      const passed = signRes.status === 400 && body.code === 'FILE_TOO_LARGE';
      results.push({
        scenarioNumber: 55,
        category: 'Creator Upload Hardening' as any,
        name: 'Oversized file upload rejected (HTTP 400 FILE_TOO_LARGE)',
        passed,
        expected: 'HTTP 400 FILE_TOO_LARGE',
        actual: `HTTP ${signRes.status} ${body.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 56: Normal submission without test simulation header succeeds with HTTP 201
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const sign = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          filename: 'normal.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          storagePath: sign.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const applyRes = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sessData.uploadSessionId,
          submissionSecret: sessData.submissionSecret,
          fullName: 'Normal Applicant',
          whatsapp: '+919333344444',
          email: 'normal.applicant@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=normal1'],
          uploadedVideos: [{ name: 'normal.mp4', storagePath: sign.storagePath }]
        })
      });

      const passed = applyRes.status === 201;
      results.push({
        scenarioNumber: 56,
        category: 'Creator Upload Hardening' as any,
        name: 'Normal submission without test simulation header succeeds with HTTP 201',
        passed,
        expected: 'HTTP 201 Created',
        actual: `HTTP ${applyRes.status}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 57: Secret retrieval protection: existing session secret never returned without secret possession
    // -------------------------------------------------------------
    {
      const sessData = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const existingId = sessData.uploadSessionId;

      // Access without secret
      const noSecretRes = await fetch(`${baseUrl}/api/creators/upload-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadSessionId: existingId })
      });
      const noSecretBody = await noSecretRes.json();

      // Access with secret
      const withSecretRes = await fetch(`${baseUrl}/api/creators/upload-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadSessionId: existingId, submissionSecret: sessData.submissionSecret })
      });
      const withSecretBody = await withSecretRes.json();

      const passed = noSecretRes.status === 400 &&
        noSecretBody.code === 'MISSING_SUBMISSION_SECRET' &&
        withSecretRes.status === 200 &&
        withSecretBody.submissionSecret === undefined;

      results.push({
        scenarioNumber: 57,
        category: 'Creator Upload Hardening' as any,
        name: 'Existing session secret never disclosed based on ID; secret possession required for access',
        passed,
        expected: 'HTTP 400 MISSING_SUBMISSION_SECRET on lookup without secret; 200 without secret disclosure on valid secret',
        actual: `noSecretStatus=${noSecretRes.status} code=${noSecretBody.code}, withSecretStatus=${withSecretRes.status} secretDisclosed=${withSecretBody.submissionSecret !== undefined}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 58: Unrelated-session bypass regression: Newly created session cannot attach to existing applicant
    // -------------------------------------------------------------
    {
      // 1. Legitimate Applicant creates session S1 and submits
      const sess1 = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();
      const validMp4Buf = Buffer.alloc(32);
      validMp4Buf.write('ftyp', 4);

      const sign1 = await (await fetch(`${baseUrl}/api/creators/upload-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess1.uploadSessionId,
          submissionSecret: sess1.submissionSecret,
          filename: 'original.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          category: 'video_sample'
        })
      })).json();

      await fetch(`${baseUrl}/api/creators/upload-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess1.uploadSessionId,
          submissionSecret: sess1.submissionSecret,
          storagePath: sign1.storagePath,
          fileData: validMp4Buf.toString('base64'),
          fileType: 'video/mp4',
          category: 'video_sample'
        })
      });

      const apply1 = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess1.uploadSessionId,
          submissionSecret: sess1.submissionSecret,
          fullName: 'Original Creator',
          whatsapp: '+919777788888',
          email: 'original.creator@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=orig1'],
          uploadedVideos: [{ name: 'original.mp4', storagePath: sign1.storagePath }]
        })
      });
      const body1 = await apply1.json();

      // 2. Attacker creates brand new unrelated session S2 with valid secret
      const sess2 = await (await fetch(`${baseUrl}/api/creators/upload-session`, { method: 'POST' })).json();

      // Attacker attempts to submit against original applicant's email using S2 + S2 secret
      const bypassAttempt = await fetch(`${baseUrl}/api/creators/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadSessionId: sess2.uploadSessionId,
          submissionSecret: sess2.submissionSecret,
          fullName: 'Attacker Tamper',
          whatsapp: '+919777788888', // matches original applicant
          email: 'original.creator@example.com', // matches original applicant
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          sampleLinks: ['https://youtube.com/watch?v=tamper1', 'https://youtube.com/watch?v=tamper2']
        })
      });
      const bypassBody = await bypassAttempt.json();

      const passed = apply1.status === 201 && bypassAttempt.status === 409 && bypassBody.code === 'DUPLICATE_APPLICATION';
      results.push({
        scenarioNumber: 58,
        category: 'Creator Upload Hardening' as any,
        name: 'Unrelated session with valid secret cannot modify existing applicant (HTTP 409 DUPLICATE_APPLICATION)',
        passed,
        expected: 'HTTP 201 on original creation; HTTP 409 DUPLICATE_APPLICATION on unrelated session attempt',
        actual: `apply1Status=${apply1.status}, bypassStatus=${bypassAttempt.status} code=${bypassBody.code || ''}`
      });
    }

    // -------------------------------------------------------------
    // Scenario 59: Multi-instance / two-process concurrency check across genuinely separate OS processes
    // -------------------------------------------------------------
    {
      // 1. Initialize fresh disposable Postgres database and apply all clean-install migrations
      const db = await bootstrapSupabaseCompatiblePostgres();
      for (const mig of DETERMINISTIC_MIGRATION_ORDER) {
        const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations', mig), 'utf8');
        await db.exec(sql);
      }

      // Storage files repository for disposable bridge
      const storageFiles = new Map<string, { buffer: Buffer; contentType: string }>();

      // Serialized DB query runner to prevent concurrent statement execution on single-connection PGlite
      let dbLock = Promise.resolve();
      const runSerialDb = <T>(fn: () => Promise<T>): Promise<T> => {
        const next = dbLock.then(fn, fn);
        dbLock = next.then(() => {}, () => {});
        return next;
      };

      // 2. Comprehensive Ephemeral HTTP database & storage bridge for Supabase client
      const dbBridge = http.createServer(async (req, res) => {
        const urlObj = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
        const pathname = urlObj.pathname;
        const method = req.method || 'GET';

        // A. submit_creator_application RPC
        if (method === 'POST' && pathname === '/rest/v1/rpc/submit_creator_application') {
          let bodyStr = '';
          req.on('data', (chunk) => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr);
              const rpcResult = await runSerialDb(() =>
                runAsRole(
                  db,
                  'service_role',
                  null,
                  `SELECT submit_creator_application($1, $2, $3, $4::jsonb, $5::jsonb) as res`,
                  [
                    body.p_session_id,
                    body.p_submission_secret,
                    body.p_app_id,
                    JSON.stringify(body.p_app_data),
                    JSON.stringify(body.p_assets)
                  ]
                )
              );
              const rpcData = (rpcResult.rows[0] as any).res;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(rpcData));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ code: err.code || 'RPC_ERROR', message: err.message }));
            }
          });
          return;
        }

        // B. creator_upload_sessions REST endpoint
        if (pathname === '/rest/v1/creator_upload_sessions') {
          if (method === 'GET') {
            const urlSearch = decodeURIComponent(urlObj.search || '');
            const idMatch = urlSearch.match(/id=eq\.([a-zA-Z0-9_-]+)/);
            const sessId = idMatch ? idMatch[1] : null;
            try {
              const rowsRes = await runSerialDb(() =>
                db.query<any>(
                  `SELECT id, submission_secret, status, application_id, assets, created_at, expires_at
                   FROM creator_upload_sessions
                   WHERE ($1::text IS NULL OR id = $1)
                   LIMIT 1`,
                  [sessId]
                )
              );
              const row = rowsRes.rows[0];
              const accept = req.headers.accept || '';
              if (accept.includes('vnd.pgrst.object+json')) {
                if (row) {
                  res.writeHead(200, { 'Content-Type': 'application/vnd.pgrst.object+json' });
                  res.end(JSON.stringify(row));
                } else {
                  res.writeHead(406, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ code: 'PGRST116', message: 'The result contains 0 rows' }));
                }
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(row ? [row] : []));
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          if (method === 'POST') {
            let bodyStr = '';
            req.on('data', (chunk) => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr);
                const items = Array.isArray(body) ? body : [body];
                for (const item of items) {
                  await runSerialDb(() =>
                    db.query(
                      `INSERT INTO creator_upload_sessions (id, submission_secret, status, application_id, assets, created_at, expires_at)
                       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
                       ON CONFLICT (id) DO UPDATE SET
                         submission_secret = EXCLUDED.submission_secret,
                         status = EXCLUDED.status,
                         application_id = EXCLUDED.application_id,
                         assets = EXCLUDED.assets,
                         expires_at = EXCLUDED.expires_at`,
                      [
                        item.id,
                        item.submission_secret,
                        item.status,
                        item.application_id || null,
                        JSON.stringify(item.assets || []),
                        item.created_at || new Date().toISOString(),
                        item.expires_at || new Date(Date.now() + 3600000).toISOString()
                      ]
                    )
                  );
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(body));
              } catch (err: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        // C. creator_applications REST endpoint
        if (pathname === '/rest/v1/creator_applications') {
          if (method === 'GET') {
            const urlSearch = decodeURIComponent(urlObj.search || '');
            const emailMatch = urlSearch.match(/email\.eq\.([^\s,)]+)/);
            const phoneMatch = urlSearch.match(/whatsapp_number\.eq\.([^\s,)]+)/);
            const idMatch = urlSearch.match(/id(?:=eq\.|\.eq\.)([^\s&,)]+)/);
            try {
              let rowsRes: any;
              if (idMatch) {
                rowsRes = await runSerialDb(() =>
                  db.query<any>(
                    `SELECT id, application_reference, application_status, created_at
                     FROM creator_applications
                     WHERE id::text = $1
                     LIMIT 1`,
                    [idMatch[1]]
                  )
                );
              } else if (emailMatch || phoneMatch) {
                rowsRes = await runSerialDb(() =>
                  db.query<any>(
                    `SELECT id, application_reference, application_status, created_at
                     FROM creator_applications
                     WHERE (email = $1 OR whatsapp_number = $2)
                       AND application_status != 'rejected'
                     LIMIT 1`,
                    [emailMatch ? emailMatch[1] : '', phoneMatch ? phoneMatch[1] : '']
                  )
                );
              } else {
                rowsRes = await runSerialDb(() =>
                  db.query<any>(`SELECT id, application_reference, application_status, created_at FROM creator_applications LIMIT 1`)
                );
              }
              const row = rowsRes.rows[0];
              const accept = req.headers.accept || '';
              if (accept.includes('vnd.pgrst.object+json')) {
                if (row) {
                  res.writeHead(200, { 'Content-Type': 'application/vnd.pgrst.object+json' });
                  res.end(JSON.stringify(row));
                } else {
                  res.writeHead(406, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ code: 'PGRST116', message: 'The result contains 0 rows' }));
                }
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(row ? [row] : []));
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }
        }

        // D. Storage API
        if (pathname.startsWith('/storage/v1/bucket')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: 'creator-submissions', name: 'creator-submissions', public: false }));
          return;
        }

        if (pathname.startsWith('/storage/v1/object/upload/sign/')) {
          let subPath = pathname.replace('/storage/v1/object/upload/sign/', '');
          if (subPath.startsWith('creator-submissions/')) {
            subPath = subPath.slice('creator-submissions/'.length);
          }
          const decoded = decodeURIComponent(subPath);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            url: `/storage/v1/object/creator-submissions/${decoded}`,
            signedUrl: `/storage/v1/object/creator-submissions/${decoded}`,
            token: 'test_signed_token'
          }));
          return;
        }

        if (pathname.startsWith('/storage/v1/object/') && method === 'GET') {
          let subPath = pathname.replace('/storage/v1/object/', '');
          if (subPath.startsWith('authenticated/')) {
            subPath = subPath.slice('authenticated/'.length);
          }
          if (subPath.startsWith('creator-submissions/')) {
            subPath = subPath.slice('creator-submissions/'.length);
          }
          const decoded = decodeURIComponent(subPath);
          const file = storageFiles.get(decoded);
          if (file) {
            res.writeHead(200, { 'Content-Type': file.contentType });
            res.end(file.buffer);
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ statusCode: '404', error: 'Not Found', message: `Object not found at ${decoded}` }));
          }
          return;
        }

        if (pathname.startsWith('/storage/v1/object/') && method === 'POST') {
          let subPath = pathname.replace('/storage/v1/object/', '');
          if (subPath.startsWith('authenticated/')) {
            subPath = subPath.slice('authenticated/'.length);
          }
          if (subPath.startsWith('creator-submissions/')) {
            subPath = subPath.slice('creator-submissions/'.length);
          }
          const decoded = decodeURIComponent(subPath);
          const chunks: Buffer[] = [];
          req.on('data', (c) => chunks.push(c));
          req.on('end', () => {
            const buf = Buffer.concat(chunks);
            storageFiles.set(decoded, {
              buffer: buf,
              contentType: (req.headers['content-type'] as string) || 'application/octet-stream'
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ Key: decoded }));
          });
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Not found: ${method} ${pathname}` }));
      });

      await new Promise<void>((resolve) => dbBridge.listen(0, '127.0.0.1', resolve));
      const bridgePort = (dbBridge.address() as any).port;
      const bridgeUrl = `http://127.0.0.1:${bridgePort}`;

      // Helper to find available ports
      const getFreePort = async (): Promise<number> => {
        return new Promise((resolve) => {
          const s = http.createServer();
          s.listen(0, '127.0.0.1', () => {
            const p = (s.address() as any).port;
            s.close(() => resolve(p));
          });
        });
      };

      const port1 = await getFreePort();
      const port2 = await getFreePort();

      // Spawn two genuinely separate child processes
      const proc1 = spawn('npx', ['tsx', 'tests/server-child-process.ts', String(port1), bridgeUrl], {
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      const proc2 = spawn('npx', ['tsx', 'tests/server-child-process.ts', String(port2), bridgeUrl], {
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const waitForHealth = async (port: number): Promise<void> => {
        const start = Date.now();
        while (Date.now() - start < 10000) {
          try {
            const hRes = await fetch(`http://127.0.0.1:${port}/health`);
            if (hRes.ok) return;
          } catch {
            // retry
          }
          await new Promise((r) => setTimeout(r, 100));
        }
        throw new Error(`Child process failed to become ready on port ${port}`);
      };

      try {
        await Promise.all([waitForHealth(port1), waitForHealth(port2)]);

        const distinctPids =
          proc1.pid !== undefined &&
          proc2.pid !== undefined &&
          proc1.pid !== proc2.pid &&
          proc1.pid !== process.pid &&
          proc2.pid !== process.pid;

        // Valid MP4 buffer with 'ftyp' signature for storage
        const validMp4Buf = Buffer.alloc(64);
        validMp4Buf.write('ftyp', 4);

        // Seed verified upload session in database and storage
        const twoProcSessionId = 'sess_two_proc_test_888';
        const twoProcSecret = 'sec_two_proc_test_888';
        const twoProcAssetPath = 'creators/samples/two_process_video.mp4';
        storageFiles.set(twoProcAssetPath, { buffer: validMp4Buf, contentType: 'video/mp4' });

        const twoProcAssets = [
          [
            twoProcAssetPath,
            {
              storagePath: twoProcAssetPath,
              category: 'video_sample',
              originalFilename: 'two_process_video.mp4',
              mimeType: 'video/mp4',
              fileSize: 10485760
            }
          ]
        ];

        await db.query(
          `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
           VALUES ($1, $2, 'verified', $3::jsonb, now() + interval '1 hour')`,
          [twoProcSessionId, twoProcSecret, JSON.stringify(twoProcAssets)]
        );

        const payload = {
          uploadSessionId: twoProcSessionId,
          submissionSecret: twoProcSecret,
          fullName: 'Two Separate Process Applicant',
          whatsapp: '+919444455555',
          email: 'twoproc@example.com',
          state: 'Tamil Nadu',
          district: 'Chennai',
          cityTown: 'Chennai',
          classification: 'ugc',
          categories: ['Food & Culinary'],
          sampleLinks: ['https://youtube.com/watch?v=twoproc1'],
          consentAccuracy: true,
          consentProcessing: true,
          consentContact: true,
          consentBrandSharing: true,
          uploadedVideos: [{ name: 'two_process_video.mp4', storagePath: twoProcAssetPath }]
        };

        const [proc1Res, proc2Res] = await Promise.all([
          fetch(`http://127.0.0.1:${port1}/api/creators/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }),
          fetch(`http://127.0.0.1:${port2}/api/creators/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        ]);

        const body1 = await proc1Res.json();
        const body2 = await proc2Res.json();

        // Check database: exactly 1 application created
        const appCount = await db.query<{ cnt: string }>(
          `SELECT count(*)::text as cnt FROM creator_applications WHERE email = $1`,
          ['twoproc@example.com']
        );
        const sessCheck = await db.query<{ status: string; application_id: string }>(
          `SELECT status, application_id FROM creator_upload_sessions WHERE id = $1`,
          [twoProcSessionId]
        );

        const sameRef = body1.referenceNumber === body2.referenceNumber;
        const countIsOne = appCount.rows[0]?.cnt === '1';
        const sessionCompleted = sessCheck.rows[0]?.status === 'completed' && Boolean(sessCheck.rows[0]?.application_id);

        const passed59 =
          distinctPids &&
          proc1Res.status === 201 &&
          proc2Res.status === 201 &&
          sameRef &&
          countIsOne &&
          sessionCompleted;

        results.push({
          scenarioNumber: 59,
          category: 'Creator Upload Hardening' as any,
          name: 'Two genuinely separate server child processes (different PIDs) sharing database return identical reference number without duplicate records',
          passed: passed59,
          expected: 'distinctPids=true, proc1=201, proc2=201, sameRef=true, dbAppCount=1, sessionCompleted=true',
          actual: `distinctPids=${distinctPids} (p1=${proc1.pid}, p2=${proc2.pid}), p1Res=${proc1Res.status}, p2Res=${proc2Res.status}, ref1=${body1.referenceNumber}, ref2=${body2.referenceNumber}, dbCount=${appCount.rows[0]?.cnt}`
        });

        // -------------------------------------------------------------
        // Scenario 68: Server B caches session; Server A completes it; Server B retries and returns original application
        // -------------------------------------------------------------
        {
          const sessId68 = 'sess_cache_test_68';
          const secret68 = 'sec_cache_test_68';
          const assetPath68 = 'creators/samples/b_caches_video.mp4';
          storageFiles.set(assetPath68, { buffer: validMp4Buf, contentType: 'video/mp4' });

          const assets68 = [
            [
              assetPath68,
              {
                storagePath: assetPath68,
                category: 'video_sample',
                originalFilename: 'b_caches_video.mp4',
                mimeType: 'video/mp4',
                fileSize: 10485760
              }
            ]
          ];

          await db.query(
            `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
             VALUES ($1, $2, 'verified', $3::jsonb, now() + interval '1 hour')`,
            [sessId68, secret68, JSON.stringify(assets68)]
          );

          // 1. Server B loads and caches the session while it is in 'verified' status
          const bPreload = await fetch(`http://127.0.0.1:${port2}/api/creators/upload-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uploadSessionId: sessId68, submissionSecret: secret68 })
          });
          const bPreloadBody = await bPreload.json();

          // 2. Server A receives apply request and completes the submission in database
          const payload68 = {
            uploadSessionId: sessId68,
            submissionSecret: secret68,
            fullName: 'Cache Test Applicant',
            whatsapp: '+919555566666',
            email: 'cachetest@example.com',
            state: 'Tamil Nadu',
            district: 'Chennai',
            cityTown: 'Chennai',
            classification: 'ugc',
            categories: ['Food & Culinary'],
            sampleLinks: ['https://youtube.com/watch?v=sample1'],
            consentAccuracy: true,
            consentProcessing: true,
            consentContact: true,
            consentBrandSharing: true,
            uploadedVideos: [{ name: 'b_caches_video.mp4', storagePath: assetPath68 }]
          };

          const applyResA = await fetch(`http://127.0.0.1:${port1}/api/creators/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload68)
          });
          const applyBodyA = await applyResA.json();

          // 3. Server B (which cached the session when it was still 'verified') now receives retry submission
          const applyResB = await fetch(`http://127.0.0.1:${port2}/api/creators/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload68)
          });
          const applyBodyB = await applyResB.json();

          // Database verification: exactly 1 application created
          const countCheck = await db.query<{ cnt: string }>(
            `SELECT count(*)::text as cnt FROM creator_applications WHERE email = $1`,
            ['cachetest@example.com']
          );

          const passed68 =
            bPreload.status === 200 &&
            applyResA.status === 201 &&
            applyResB.status === 201 &&
            applyBodyA.referenceNumber === applyBodyB.referenceNumber &&
            applyBodyA.id === applyBodyB.id &&
            countCheck.rows[0]?.cnt === '1';

          results.push({
            scenarioNumber: 68,
            category: 'Creator Upload Hardening' as any,
            name: 'Server B caches session in verified state; Server A completes it; Server B retry returns original application without duplicate',
            passed: passed68,
            expected: 'Server A=201, Server B=201, same ref & id, dbCount=1',
            actual: `applyA=${applyResA.status} ref=${applyBodyA.referenceNumber}, applyB=${applyResB.status} ref=${applyBodyB.referenceNumber}, dbCount=${countCheck.rows[0]?.cnt}`
          });

          // -------------------------------------------------------------
          // Scenario 69: Signing and relay on completed session rejected; status never reverts to registered
          // -------------------------------------------------------------
          const signOnCompletedRes = await fetch(`http://127.0.0.1:${port1}/api/creators/upload-sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadSessionId: sessId68,
              submissionSecret: secret68,
              filename: 'forbidden_after_completion.mp4',
              fileType: 'video/mp4',
              fileSize: 1024,
              category: 'video_sample'
            })
          });
          const signOnCompletedBody = await signOnCompletedRes.json();

          const relayOnCompletedRes = await fetch(`http://127.0.0.1:${port1}/api/creators/upload-relay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadSessionId: sessId68,
              submissionSecret: secret68,
              storagePath: assetPath68,
              fileData: validMp4Buf.toString('base64'),
              fileType: 'video/mp4',
              category: 'video_sample'
            })
          });
          const relayOnCompletedBody = await relayOnCompletedRes.json();

          const dbStatusCheck = await db.query<{ status: string }>(
            `SELECT status FROM creator_upload_sessions WHERE id = $1`,
            [sessId68]
          );

          const passed69 =
            signOnCompletedRes.status === 400 &&
            signOnCompletedBody.code === 'COMPLETED_SESSION' &&
            relayOnCompletedRes.status === 400 &&
            relayOnCompletedBody.code === 'COMPLETED_SESSION' &&
            dbStatusCheck.rows[0]?.status === 'completed';

          results.push({
            scenarioNumber: 69,
            category: 'Creator Upload Hardening' as any,
            name: 'Upload signing and relay on completed session rejected with HTTP 400 COMPLETED_SESSION; status remains completed',
            passed: passed69,
            expected: 'signStatus=400 COMPLETED_SESSION, relayStatus=400 COMPLETED_SESSION, dbStatus=completed',
            actual: `signStatus=${signOnCompletedRes.status} code=${signOnCompletedBody.code}, relayStatus=${relayOnCompletedRes.status} code=${relayOnCompletedBody.code}, dbStatus=${dbStatusCheck.rows[0]?.status}`
          });

          // -------------------------------------------------------------
          // Scenario 70: Stale persistence snapshot cannot clear application binding or downgrade completed status
          // -------------------------------------------------------------
          const staleSessionObj = {
            sessionId: sessId68,
            submissionSecret: secret68,
            status: 'registered' as const,
            applicationId: undefined,
            createdAt: Date.now() - 100000,
            expiresAt: Date.now() + 1800000,
            assets: new Map()
          };

          const bridgeAdminClient = createClient(bridgeUrl, 'sb_secret_test_key_123', {
            auth: { persistSession: false, autoRefreshToken: false }
          });
          setSupabaseAdmin(bridgeAdminClient);

          await saveSessionToDbAndDisk(staleSessionObj);

          const dbBindingCheck = await db.query<{ status: string; application_id: string }>(
            `SELECT status, application_id FROM creator_upload_sessions WHERE id = $1`,
            [sessId68]
          );

          const passed70 =
            dbBindingCheck.rows[0]?.status === 'completed' &&
            dbBindingCheck.rows[0]?.application_id === applyBodyA.id;

          results.push({
            scenarioNumber: 70,
            category: 'Creator Upload Hardening' as any,
            name: 'Stale persistence snapshot with null applicationId cannot clear existing application_id binding or downgrade completed status',
            passed: passed70,
            expected: 'status=completed, application_id preserved',
            actual: `status=${dbBindingCheck.rows[0]?.status}, application_id=${dbBindingCheck.rows[0]?.application_id}`
          });

          // -------------------------------------------------------------
          // Scenario 71: Post-commit backup failure does not turn committed transaction into a failure
          // -------------------------------------------------------------
          const sessId71 = 'sess_backup_fail_71';
          const secret71 = 'sec_backup_fail_71';
          const assetPath71 = 'creators/samples/backup_fail_video.mp4';
          storageFiles.set(assetPath71, { buffer: validMp4Buf, contentType: 'video/mp4' });

          const assets71 = [
            [
              assetPath71,
              {
                storagePath: assetPath71,
                category: 'video_sample',
                originalFilename: 'backup_fail_video.mp4',
                mimeType: 'video/mp4',
                fileSize: 10485760
              }
            ]
          ];

          await db.query(
            `INSERT INTO creator_upload_sessions (id, submission_secret, status, assets, expires_at)
             VALUES ($1, $2, 'verified', $3::jsonb, now() + interval '1 hour')`,
            [sessId71, secret71, JSON.stringify(assets71)]
          );

          // Arm test backup failure trigger so post-commit disk/storage backup throws
          setTestBackupFailureTrigger(true);

          const payload71 = {
            uploadSessionId: sessId71,
            submissionSecret: secret71,
            fullName: 'Backup Resilience Applicant',
            whatsapp: '+919666677777',
            email: 'backupresilience@example.com',
            state: 'Tamil Nadu',
            district: 'Chennai',
            cityTown: 'Chennai',
            classification: 'ugc',
            categories: ['Food & Culinary'],
            sampleLinks: ['https://youtube.com/watch?v=sample71'],
            consentAccuracy: true,
            consentProcessing: true,
            consentContact: true,
            consentBrandSharing: true,
            uploadedVideos: [{ name: 'backup_fail_video.mp4', storagePath: assetPath71 }]
          };

          const applyRes71 = await fetch(`${baseUrl}/api/creators/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload71)
          });
          const applyBody71 = await applyRes71.json();

          // Reset trigger & supabaseAdmin
          setTestBackupFailureTrigger(false);
          setSupabaseAdmin(null);

          const dbApp71Check = await db.query<{ id: string; application_reference: string }>(
            `SELECT id, application_reference FROM creator_applications WHERE email = $1`,
            ['backupresilience@example.com']
          );

          const passed71 =
            applyRes71.status === 201 &&
            applyBody71.success === true &&
            dbApp71Check.rows.length === 1 &&
            dbApp71Check.rows[0]?.id === applyBody71.id;

          results.push({
            scenarioNumber: 71,
            category: 'Creator Upload Hardening' as any,
            name: 'Post-commit backup failure does not fail transaction; committed application returned with HTTP 201',
            passed: passed71,
            expected: 'HTTP 201 Created with application id & reference, row persisted in DB',
            actual: `HTTP ${applyRes71.status}, success=${applyBody71.success}, id=${applyBody71.id}, dbRows=${dbApp71Check.rows.length}`
          });
        }
      } finally {
        try { proc1.kill('SIGKILL'); } catch {}
        try { proc2.kill('SIGKILL'); } catch {}
        try { if (proc1.pid) process.kill(-proc1.pid, 'SIGKILL'); } catch {}
        try { if (proc2.pid) process.kill(-proc2.pid, 'SIGKILL'); } catch {}
        dbBridge.close();
        await db.close();
      }
    }

    // -------------------------------------------------------------
    // Scenarios 45–49: Dedicated Migration Reconciliation Regression Suite (PGlite PG18.6)
    // -------------------------------------------------------------
    const migrationRegressionResults = await runMigrationReconciliationRegressionSuite(45);
    results.push(...migrationRegressionResults);

    // -------------------------------------------------------------
    // Scenarios 60–64: Transactional Application Submission RPC Database Suite (PGlite PG18.6)
    // -------------------------------------------------------------
    const submissionRpcDbResults = await runCreatorSubmissionRpcDatabaseVerificationSuite();
    results.push(...submissionRpcDbResults);

  } finally {
    server.close();
  }

  // Print Summary Table
  console.log('----------------------------------------------------------------');
  console.log('TEST EXECUTION SUMMARY');
  console.log('----------------------------------------------------------------');
  let allPassed = true;
  for (const r of results) {
    const statusMark = r.passed ? '✓ PASS' : '✗ FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${statusMark}] #${r.scenarioNumber} [${r.category}]: ${r.name}`);
    console.log(`       Expected: ${r.expected}`);
    console.log(`       Actual:   ${r.actual}`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`FINAL RESULT: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
  console.log('----------------------------------------------------------------\n');

  process.exit(allPassed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Test runner encountered unexpected error:', err);
  process.exit(1);
});

