process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'path';
import {
  app,
  memoryAdminUsers,
  memoryTokens
} from '../server';
import {
  clearPreviewConversationStore,
  persistConversationMessages
} from '../src/lib/receptionistConversationStore';
import {
  loadOrCreateIsolatedTabSessions,
  resetActiveModeSession,
  StorageLike
} from '../src/lib/receptionistSessionStorage';
import { validateModeScopedSessionIsolation } from '../src/lib/receptionistKnowledge';
import { CLOUDFLARE_RECEPTIONIST_CHAT_URL } from '../src/lib/receptionistServerCore';
import { CLOUDFLARE_CHAT_ENDPOINT, receptionistService } from '../src/services/receptionistService';
import {
  bootstrapSupabaseCompatiblePostgres,
  DETERMINISTIC_MIGRATION_ORDER,
  grantSupabaseTablePrivileges,
  runAsRole,
  TEST_DB_USERS
} from './db-evaluator-privacy.test';

const TEST_TOKENS = {
  superadmin: 'conv_test_token_superadmin_001',
  admin: 'conv_test_token_admin_002',
  evaluator: 'conv_test_token_evaluator_003',
  ordinary: 'conv_test_token_ordinary_004'
};

const TEST_USERS = {
  superadmin: {
    id: 'aaaa1111-1111-4111-8111-111111111111',
    email: 'superadmin.inbox@unikorn360.com',
    role: 'superadmin' as const
  },
  admin: {
    id: 'aaaa2222-2222-4222-8222-222222222222',
    email: 'ops.inbox@unikorn360.com',
    role: 'admin' as const
  },
  evaluator: {
    id: 'aaaa3333-3333-4333-8333-333333333333',
    email: 'eval.inbox@unikorn360.com',
    role: 'evaluator' as const
  },
  ordinary: {
    id: 'aaaa4444-4444-4444-8444-444444444444',
    email: 'outsider@example.com',
    role: 'evaluator' as const
  }
};

function registerTestUsers() {
  memoryTokens.set(TEST_TOKENS.superadmin, TEST_USERS.superadmin);
  memoryTokens.set(TEST_TOKENS.admin, TEST_USERS.admin);
  memoryTokens.set(TEST_TOKENS.evaluator, TEST_USERS.evaluator);
  memoryTokens.set(TEST_TOKENS.ordinary, TEST_USERS.ordinary);

  for (const user of [TEST_USERS.superadmin, TEST_USERS.admin, TEST_USERS.evaluator]) {
    if (!memoryAdminUsers.some((m) => m.authenticated_user_id === user.id)) {
      memoryAdminUsers.push({
        id: `mem-${user.role}-${user.id.slice(0, 6)}`,
        authenticated_user_id: user.id,
        email: user.email,
        role: user.role
      });
    }
  }
}

async function runDatabaseMigrationAndRlsTests() {
  console.log('1) Running PGlite migration, trigger, constraint, WhatsApp readiness, and RLS isolation tests...');
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const db = await bootstrapSupabaseCompatiblePostgres();

  try {
    for (const filename of DETERMINISTIC_MIGRATION_ORDER) {
      const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
      await db.exec(sql);
    }

    await grantSupabaseTablePrivileges(db);

    const enquiryMigration = fs.readFileSync(
      path.join(migrationsDir, '20261125_ai_receptionist_enquiries.sql'),
      'utf8'
    );
    await db.exec(enquiryMigration);

    const convMigration = fs.readFileSync(
      path.join(migrationsDir, '20261126_ai_receptionist_conversations.sql'),
      'utf8'
    );
    await db.exec(convMigration);

    const hardeningMigration = fs.readFileSync(
      path.join(migrationsDir, '20261127_receptionist_session_isolation_hardening.sql'),
      'utf8'
    );
    await db.exec(hardeningMigration);

    // Seed auth users & admin roles for RLS testing
    for (const u of Object.values(TEST_DB_USERS)) {
      await db.query(
        `INSERT INTO auth.users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email]
      );
    }
    for (const u of [TEST_DB_USERS.superadmin, TEST_DB_USERS.admin, TEST_DB_USERS.evaluator]) {
      await db.query(
        `INSERT INTO public.creator_admin_users (authenticated_user_id, email, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (authenticated_user_id) DO UPDATE SET role = EXCLUDED.role`,
        [u.id, u.email, u.role]
      );
    }

    // Verify RLS enabled on both tables
    const rlsRes = await db.query<{ tablename: string; rowsecurity: boolean }>(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('receptionist_conversations', 'receptionist_messages')
      ORDER BY tablename
    `);
    assert.equal(rlsRes.rows.length, 2, 'Both conversation CRM tables must exist');
    assert.ok(
      rlsRes.rows.every((r) => r.rowsecurity === true),
      'RLS must be enabled on receptionist_conversations and receptionist_messages'
    );

    // Service role creates Live & Demo website conversations + WhatsApp-ready conversation
    const liveConvRes = await runAsRole<{ id: string; last_message_at: string }>(
      db,
      'service_role',
      null,
      `INSERT INTO public.receptionist_conversations (
         session_id, source_channel, source_mode, detected_language, current_page, session_token_hash
       ) VALUES ('sess-pg-1', 'website', 'live', 'tanglish', '/services', 'hash_pg_1')
       RETURNING id, last_message_at::text`
    );
    const liveConvId = liveConvRes.rows[0].id;

    // Separate Demo row with identical session_id is allowed because unique key includes source_mode
    const demoConvRes = await runAsRole<{ id: string }>(
      db,
      'service_role',
      null,
      `INSERT INTO public.receptionist_conversations (
         session_id, source_channel, source_mode, detected_language, current_page, session_token_hash
       ) VALUES ('sess-pg-1', 'website', 'demo', 'en', '/', 'hash_pg_1')
       RETURNING id`
    );
    assert.notEqual(demoConvRes.rows[0].id, liveConvId, 'Live & Demo conversations must be distinct rows');

    // Duplicate (session_id, source_channel, source_mode) must fail uniqueness constraint
    let duplicateConvBlocked = false;
    try {
      await runAsRole(
        db,
        'service_role',
        null,
        `INSERT INTO public.receptionist_conversations (
           session_id, source_channel, source_mode
         ) VALUES ('sess-pg-1', 'website', 'live')`
      );
    } catch {
      duplicateConvBlocked = true;
    }
    assert.ok(duplicateConvBlocked, 'Duplicate (session_id, source_channel, source_mode) must be rejected');

    // WhatsApp schema readiness check
    const waConvRes = await runAsRole<{ id: string }>(
      db,
      'service_role',
      null,
      `INSERT INTO public.receptionist_conversations (
         session_id, source_channel, source_mode, customer_identifier, detected_language, conversation_status
       ) VALUES ('wa:+919876543210', 'whatsapp', 'live', '+91 98765 43210', 'ta', 'new')
       RETURNING id`
    );
    const waConvId = waConvRes.rows[0].id;
    await runAsRole(
      db,
      'service_role',
      null,
      `INSERT INTO public.receptionist_messages (
         conversation_id, message_id, sender_type, message_content, delivery_status
       ) VALUES ($1, 'wamid.HBgMOTE5ODc2NTQzMjEw', 'agent', 'Vanakkam from UNIKORN360 team', 'sent')`,
      [waConvId]
    );

    // Insert message with future created_at to verify trigger updates last_message_at
    const futureTs = '2027-01-15T10:30:00Z';
    await runAsRole(
      db,
      'service_role',
      null,
      `INSERT INTO public.receptionist_messages (
         conversation_id, message_id, sender_type, message_content, ai_model, delivery_status, created_at
       ) VALUES ($1, 'msg-live-01', 'assistant', 'Welcome to UNIKORN360', 'gemini-3.8-flash', 'delivered', $2)`,
      [liveConvId, futureTs]
    );

    const syncedConv = await runAsRole<{ last_message_at: string }>(
      db,
      'service_role',
      null,
      `SELECT last_message_at::text FROM public.receptionist_conversations WHERE id = $1`,
      [liveConvId]
    );
    assert.ok(
      new Date(syncedConv.rows[0].last_message_at).getTime() >= new Date(futureTs).getTime(),
      'AFTER INSERT message trigger must sync conversation last_message_at'
    );

    // Duplicate message_id inside same conversation must fail unique constraint
    let duplicateMsgBlocked = false;
    try {
      await runAsRole(
        db,
        'service_role',
        null,
        `INSERT INTO public.receptionist_messages (
           conversation_id, message_id, sender_type, message_content
         ) VALUES ($1, 'msg-live-01', 'assistant', 'Duplicate retry payload')`,
        [liveConvId]
      );
    } catch {
      duplicateMsgBlocked = true;
    }
    assert.ok(duplicateMsgBlocked, 'Duplicate (conversation_id, message_id) must be blocked by unique constraint');

    // RLS ISOLATION MATRIX
    // a) anon role: zero read and zero write access
    let anonConvBlocked = false;
    try {
      const res = await runAsRole(db, 'anon', null, `SELECT id FROM public.receptionist_conversations`);
      anonConvBlocked = res.rows.length === 0;
    } catch {
      anonConvBlocked = true;
    }
    assert.ok(anonConvBlocked, 'anon must have no read access to receptionist_conversations');

    let anonMsgBlocked = false;
    try {
      const res = await runAsRole(db, 'anon', null, `SELECT id FROM public.receptionist_messages`);
      anonMsgBlocked = res.rows.length === 0;
    } catch {
      anonMsgBlocked = true;
    }
    assert.ok(anonMsgBlocked, 'anon must have no read access to receptionist_messages');

    let anonInsertBlocked = false;
    try {
      await runAsRole(
        db,
        'anon',
        null,
        `INSERT INTO public.receptionist_conversations (session_id) VALUES ('anon-attack')`
      );
    } catch {
      anonInsertBlocked = true;
    }
    assert.ok(anonInsertBlocked, 'anon must be blocked from writing conversations');

    // b) ordinary authenticated user: zero read and zero write access
    const ordConvRead = await runAsRole(
      db,
      'authenticated',
      TEST_DB_USERS.ordinaryUser.id,
      `SELECT id FROM public.receptionist_conversations`
    );
    assert.equal(ordConvRead.rows.length, 0, 'Ordinary authenticated user must see 0 conversations');

    const ordMsgRead = await runAsRole(
      db,
      'authenticated',
      TEST_DB_USERS.ordinaryUser.id,
      `SELECT id FROM public.receptionist_messages`
    );
    assert.equal(ordMsgRead.rows.length, 0, 'Ordinary authenticated user must see 0 messages');

    let ordMsgInsertBlocked = false;
    try {
      await runAsRole(
        db,
        'authenticated',
        TEST_DB_USERS.ordinaryUser.id,
        `INSERT INTO public.receptionist_messages (conversation_id, message_id, sender_type, message_content)
         VALUES ($1, 'ord-attack', 'customer', 'Injected')`,
        [liveConvId]
      );
    } catch {
      ordMsgInsertBlocked = true;
    }
    assert.ok(ordMsgInsertBlocked, 'Ordinary authenticated user must not insert receptionist_messages');

    // c) evaluator: read allowed, write blocked
    const evalConvRead = await runAsRole(
      db,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `SELECT id FROM public.receptionist_conversations`
    );
    assert.equal(evalConvRead.rows.length, 3, 'Evaluator should read conversations via admin RLS');

    const evalUpdate = await runAsRole(
      db,
      'authenticated',
      TEST_DB_USERS.evaluator.id,
      `UPDATE public.receptionist_conversations SET conversation_status = 'won' WHERE id = $1 RETURNING id`,
      [liveConvId]
    );
    assert.equal(evalUpdate.rows.length, 0, 'Evaluator must not update conversations');

    // d) admin: can update conversation_status / assigned_employee, cannot delete
    const adminUpdate = await runAsRole<{ conversation_status: string; assigned_employee: string }>(
      db,
      'authenticated',
      TEST_DB_USERS.admin.id,
      `UPDATE public.receptionist_conversations
       SET conversation_status = 'qualified', assigned_employee = 'ops@unikorn360.com'
       WHERE id = $1
       RETURNING conversation_status, assigned_employee`,
      [liveConvId]
    );
    assert.equal(adminUpdate.rows.length, 1);
    assert.equal(adminUpdate.rows[0].conversation_status, 'qualified');

    const adminDelete = await runAsRole(
      db,
      'authenticated',
      TEST_DB_USERS.admin.id,
      `DELETE FROM public.receptionist_conversations WHERE id = $1 RETURNING id`,
      [liveConvId]
    );
    assert.equal(adminDelete.rows.length, 0, 'Admin must not delete conversations (superadmin only)');

    // e) superadmin: can delete
    const superDelete = await runAsRole(
      db,
      'authenticated',
      TEST_DB_USERS.superadmin.id,
      `DELETE FROM public.receptionist_conversations WHERE id = $1 RETURNING id`,
      [demoConvRes.rows[0].id]
    );
    assert.equal(superDelete.rows.length, 1, 'Superadmin should be able to delete conversations');
  } finally {
    await db.close();
  }
}

async function runSupabaseRestAdapterTest() {
  console.log('2) Verifying Supabase REST upsert/idempotency adapter and zero external WhatsApp calls...');
  const calls: Array<{ url: string; method: string; body?: any }> = [];

  const mockFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method || 'GET';
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, method, body });

    assert.ok(
      !url.includes('graph.facebook.com') && !url.includes('whatsapp'),
      `Must never trigger outbound WhatsApp API calls: ${url}`
    );

    if (url.includes('/rest/v1/receptionist_conversations?') && method === 'GET') {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    if (url.includes('/rest/v1/receptionist_conversations?on_conflict=') && method === 'POST') {
      return new Response(
        JSON.stringify([
          {
            id: '22222222-2222-4222-8222-222222222222',
            session_id: body.session_id,
            source_channel: body.source_channel,
            source_mode: body.source_mode,
            customer_identifier: body.customer_identifier,
            detected_language: body.detected_language,
            current_page: body.current_page,
            conversation_status: 'active',
            assigned_employee: null,
            enquiry_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          }
        ]),
        { status: 201 }
      );
    }
    if (url.includes('/rest/v1/receptionist_messages?on_conflict=conversation_id,message_id')) {
      // Simulate first message inserted, second message ignored as duplicate
      if (body.message_id === 'dup-1') {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response(
        JSON.stringify([
          {
            id: '33333333-3333-4333-8333-333333333333',
            conversation_id: body.conversation_id,
            message_id: body.message_id,
            sender_type: body.sender_type,
            message_content: body.message_content,
            message_metadata: body.message_metadata,
            ai_model: body.ai_model,
            delivery_status: body.delivery_status,
            created_at: new Date().toISOString()
          }
        ]),
        { status: 201 }
      );
    }

    return new Response('[]', { status: 200 });
  };

  const result = await persistConversationMessages(
    {
      sessionId: 'rest-test-session',
      sessionToken: 'rest-test-token-1234567890',
      sourceChannel: 'website',
      sourceMode: 'live',
      currentPage: '/products/invoicepro360',
      detectedLanguage: 'en',
      messages: [
        {
          messageId: 'fresh-1',
          senderType: 'customer',
          messageContent: 'Tell me about InvoicePro360',
          messageMetadata: {
            currentPage: '/products/invoicepro360',
            turnstileToken: 'SHOULD_BE_STRIPPED'
          } as any
        },
        {
          messageId: 'dup-1',
          senderType: 'assistant',
          messageContent: 'InvoicePro360 details...',
          aiModel: 'gemini-3.8-flash'
        }
      ]
    },
    {
      SUPABASE_URL: 'https://mock-project.supabase.co',
      SUPABASE_SECRET_KEY: 'mock-secret-key'
    },
    mockFetch
  );

  assert.equal(result.storage, 'supabase');
  assert.deepEqual(result.savedMessageIds, ['fresh-1']);
  assert.deepEqual(result.duplicateSkippedIds, ['dup-1']);

  const firstMsgCall = calls.find((c) => c.body?.message_id === 'fresh-1');
  assert.ok(firstMsgCall, 'Message POST must be executed');
  assert.equal(
    firstMsgCall.body.message_metadata.turnstileToken,
    undefined,
    'Sensitive Turnstile token must be stripped before storage'
  );
}

async function runHttpIntegrationTests() {
  console.log('3) Running end-to-end HTTP CRM API, hydration, deduplication, and Admin RBAC tests...');
  clearPreviewConversationStore();
  registerTestUsers();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const sharedSessionId = 'rec_stage3_test_session_01';
    const validToken = 'tok_stage3_secret_browser_token_123456';
    const wrongToken = 'tok_attacker_wrong_browser_token_999999';

    // A. Chat turn persistence in Demo Mode (customer + assistant stored independently)
    const chatRes = await fetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sharedSessionId,
        sessionToken: validToken,
        sourceChannel: 'website',
        sourceMode: 'demo',
        mode: 'demo',
        currentPage: '/services',
        detectedLanguage: 'tanglish',
        clientMessageId: 'usr-msg-1',
        assistantMessageId: 'ast-msg-1',
        message: 'Vanakkam, enaku website development details venum',
        history: []
      })
    });
    assert.equal(chatRes.status, 200);
    const chatJson = (await chatRes.json()) as any;
    assert.equal(chatJson.persisted, true);
    assert.ok(chatJson.conversationId);
    const demoConvId = chatJson.conversationId as string;

    // B. Additional messages appended in same session (multiple messages + system handover)
    const appendRes = await fetch(`${baseUrl}/api/receptionist/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sharedSessionId,
        sessionToken: validToken,
        sourceChannel: 'website',
        sourceMode: 'demo',
        currentPage: '/products',
        detectedLanguage: 'en',
        messages: [
          {
            messageId: 'usr-msg-2',
            senderType: 'customer',
            messageContent: 'Also show InvoicePro360 pricing details'
          },
          {
            messageId: 'ast-msg-2',
            senderType: 'assistant',
            messageContent: 'InvoicePro360 automates GST billing and payment tracking.',
            aiModel: 'demo-simulator',
            messageMetadata: {
              recommendedLinks: [{ label: 'InvoicePro360', path: '/products/invoicepro360' }]
            }
          },
          {
            messageId: 'sys-msg-3',
            senderType: 'system',
            messageContent: 'Customer opened WhatsApp handover.',
            deliveryStatus: 'sent'
          }
        ]
      })
    });
    assert.equal(appendRes.status, 200);
    const appendJson = (await appendRes.json()) as any;
    assert.equal(appendJson.conversationId, demoConvId);
    assert.deepEqual(appendJson.savedMessageIds, ['usr-msg-2', 'ast-msg-2', 'sys-msg-3']);

    // C. Duplicate prevention during retries
    const retryRes = await fetch(`${baseUrl}/api/receptionist/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sharedSessionId,
        sessionToken: validToken,
        sourceChannel: 'website',
        sourceMode: 'demo',
        currentPage: '/products',
        detectedLanguage: 'en',
        messages: [
          {
            messageId: 'usr-msg-2',
            senderType: 'customer',
            messageContent: 'Also show InvoicePro360 pricing details'
          },
          {
            messageId: 'ast-msg-2',
            senderType: 'assistant',
            messageContent: 'InvoicePro360 automates GST billing and payment tracking.'
          }
        ]
      })
    });
    assert.equal(retryRes.status, 200);
    const retryJson = (await retryRes.json()) as any;
    assert.deepEqual(retryJson.savedMessageIds, []);
    assert.deepEqual(retryJson.duplicateSkippedIds, ['usr-msg-2', 'ast-msg-2']);

    // D. Browser refresh hydration access control & full chronological retrieval
    const noTokenHydrate = await fetch(
      `${baseUrl}/api/receptionist/messages?sessionId=${sharedSessionId}&sourceChannel=website&sourceMode=demo`
    );
    assert.equal(noTokenHydrate.status, 401, 'Missing session token must be rejected');

    const badTokenHydrate = await fetch(
      `${baseUrl}/api/receptionist/messages?sessionId=${sharedSessionId}&sourceChannel=website&sourceMode=demo`,
      {
        headers: { 'X-Receptionist-Session-Token': wrongToken }
      }
    );
    assert.equal(badTokenHydrate.status, 403, 'Wrong session token must be rejected');

    const validHydrate = await fetch(
      `${baseUrl}/api/receptionist/messages?sessionId=${sharedSessionId}&sourceChannel=website&sourceMode=demo`,
      {
        headers: { 'X-Receptionist-Session-Token': validToken }
      }
    );
    assert.equal(validHydrate.status, 200);
    const hydratedJson = (await validHydrate.json()) as any;
    assert.equal(hydratedJson.found, true);
    assert.equal(hydratedJson.messages.length, 5, 'Should restore all 5 unique messages without duplicates');
    assert.deepEqual(
      hydratedJson.messages.map((m: any) => m.messageId),
      ['usr-msg-1', 'ast-msg-1', 'usr-msg-2', 'ast-msg-2', 'sys-msg-3']
    );

    // E. Demo vs Live separation on the same sessionId
    const livePersistRes = await fetch(`${baseUrl}/api/receptionist/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sharedSessionId,
        sessionToken: validToken,
        sourceChannel: 'website',
        sourceMode: 'live',
        currentPage: '/contact',
        detectedLanguage: 'ta',
        messages: [
          {
            messageId: 'live-usr-1',
            senderType: 'customer',
            messageContent: 'எங்களுக்கு InvoicePro360 தேவை'
          },
          {
            messageId: 'live-ast-1',
            senderType: 'assistant',
            messageContent: 'UNIKORN360 Team can configure InvoicePro360 for your business.',
            aiModel: 'gemini-3.8-flash'
          }
        ]
      })
    });
    assert.equal(livePersistRes.status, 200);
    const livePersistJson = (await livePersistRes.json()) as any;
    const liveConvId = livePersistJson.conversationId as string;
    assert.notEqual(liveConvId, demoConvId, 'Live mode must maintain separate DB thread from Demo mode');

    const hydrateLive = await fetch(
      `${baseUrl}/api/receptionist/messages?sessionId=${sharedSessionId}&sourceChannel=website&sourceMode=live`,
      {
        headers: { 'X-Receptionist-Session-Token': validToken }
      }
    );
    const hydrateLiveJson = (await hydrateLive.json()) as any;
    assert.equal(hydrateLiveJson.messages.length, 2, 'Live hydration must only include live messages');

    // F. Enquiry submission links to Live conversation & updates customer_identifier + status
    const enqRes = await fetch(`${baseUrl}/api/receptionist/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sharedSessionId,
        sourceMode: 'live',
        detectedLanguage: 'ta',
        pageUrl: '/contact',
        enquiry: {
          customerName: 'Meenakshi Sundaram',
          businessName: 'Sundaram Exports',
          contactNumber: '+91 98765 01234',
          email: 'meenakshi@example.com',
          serviceRequired: 'InvoicePro360',
          projectDescription: 'Looking for GST invoicing deployment across two branches.'
        },
        conversationHistory: [
          {
            id: 'live-usr-1',
            role: 'user',
            content: 'எங்களுக்கு InvoicePro360 தேவை',
            timestamp: new Date().toISOString(),
            mode: 'live'
          }
        ]
      })
    });
    assert.equal(enqRes.status, 201);
    const enqJson = (await enqRes.json()) as any;
    assert.ok(enqJson.referenceCode.startsWith('U360-REC-'));

    // G. Admin Inbox endpoints: RBAC + search/filters + update + zero hash exposure
    const unauthInbox = await fetch(`${baseUrl}/api/admin/receptionist-conversations`);
    assert.equal(unauthInbox.status, 401);

    const ordinaryInbox = await fetch(`${baseUrl}/api/admin/receptionist-conversations`, {
      headers: { Authorization: `Bearer ${TEST_TOKENS.ordinary}` }
    });
    assert.equal(ordinaryInbox.status, 403);

    const evalInbox = await fetch(`${baseUrl}/api/admin/receptionist-conversations`, {
      headers: { Authorization: `Bearer ${TEST_TOKENS.evaluator}` }
    });
    assert.equal(evalInbox.status, 200);
    const evalInboxJson = (await evalInbox.json()) as any;
    assert.equal(evalInboxJson.conversations.length, 2);
    assert.equal(evalInboxJson.stats.liveThreads, 1);
    assert.equal(evalInboxJson.stats.demoThreads, 1);
    assert.ok(
      !JSON.stringify(evalInboxJson).includes('session_token_hash'),
      'session_token_hash must never be exposed in admin responses'
    );

    // Search & filter verification
    const searchRes = await fetch(
      `${baseUrl}/api/admin/receptionist-conversations?mode=demo&search=InvoicePro360`,
      { headers: { Authorization: `Bearer ${TEST_TOKENS.admin}` } }
    );
    assert.equal(searchRes.status, 200);
    const searchJson = (await searchRes.json()) as any;
    assert.equal(searchJson.conversations.length, 1);
    assert.equal(searchJson.conversations[0].id, demoConvId);

    // Evaluator cannot PATCH conversation status/assignment
    const evalPatch = await fetch(`${baseUrl}/api/admin/receptionist-conversations/${liveConvId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_TOKENS.evaluator}`
      },
      body: JSON.stringify({ conversation_status: 'qualified' })
    });
    assert.equal(evalPatch.status, 403);

    // Admin updates conversation status & assigned employee
    const adminPatch = await fetch(`${baseUrl}/api/admin/receptionist-conversations/${liveConvId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_TOKENS.admin}`
      },
      body: JSON.stringify({
        conversation_status: 'qualified',
        assigned_employee: 'ops.inbox@unikorn360.com'
      })
    });
    assert.equal(adminPatch.status, 200);

    const detailRes = await fetch(`${baseUrl}/api/admin/receptionist-conversations/${liveConvId}`, {
      headers: { Authorization: `Bearer ${TEST_TOKENS.admin}` }
    });
    assert.equal(detailRes.status, 200);
    const detailJson = (await detailRes.json()) as any;
    assert.equal(detailJson.conversation.conversation_status, 'qualified');
    assert.equal(detailJson.conversation.assigned_employee, 'ops.inbox@unikorn360.com');
    assert.equal(detailJson.conversation.enquiry_id, enqJson.enquiryId);
    assert.ok(detailJson.conversation.customer_identifier.includes('Meenakshi Sundaram'));
    assert.equal(detailJson.messages.length, 2);

    // Existing admin enquiries endpoint remains functional
    const enqAdminRes = await fetch(`${baseUrl}/api/admin/receptionist-enquiries`, {
      headers: { Authorization: `Bearer ${TEST_TOKENS.admin}` }
    });
    assert.equal(enqAdminRes.status, 200);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function runSessionIsolationAndFailurePersistenceTests() {
  console.log('4) Running INBOX360 Scenarios A–I (Session Isolation, Multi-Tab, Live AI Persistence, Failure Recording, Retry Dedup, Refresh, Historical Preservation)...');
  clearPreviewConversationStore();
  registerTestUsers();

  function createMemoryTabStorage(): StorageLike {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      }
    };
  }

  // Simulated Browser Tabs (A, B, C, D)
  const tabAStorage = createMemoryTabStorage();
  const tabBStorage = createMemoryTabStorage();

  const tabASessions = loadOrCreateIsolatedTabSessions(tabAStorage);
  const tabBSessions = loadOrCreateIsolatedTabSessions(tabBStorage);

  // (A) & (B): Demo and Live create distinct mode-prefixed session IDs
  assert.ok(tabASessions.demo.sessionId.startsWith('rec-web-demo-'));
  assert.ok(tabASessions.live.sessionId.startsWith('rec-web-live-'));
  assert.notEqual(
    tabASessions.demo.sessionId,
    tabASessions.live.sessionId,
    '(A/B) Demo and Live must never share a sessionId'
  );
  assert.notEqual(tabASessions.demo.sessionToken, tabASessions.live.sessionToken);

  // (C): Two independent browser tabs never collide
  assert.notEqual(tabASessions.live.sessionId, tabBSessions.live.sessionId, '(C) Concurrent tabs must have distinct Live sessionIds');
  assert.notEqual(tabASessions.demo.sessionId, tabBSessions.demo.sessionId, '(C) Concurrent tabs must have distinct Demo sessionIds');

  // (H): Page reload in Tab A restores the exact same session IDs & tokens
  const tabAReloaded = loadOrCreateIsolatedTabSessions(tabAStorage);
  assert.equal(tabAReloaded.live.sessionId, tabASessions.live.sessionId);
  assert.equal(tabAReloaded.demo.sessionId, tabASessions.demo.sessionId);
  assert.equal(tabAReloaded.live.sessionToken, tabASessions.live.sessionToken);

  // (D): Resetting ONLY the active mode clears Live without altering Demo (and vice versa)
  const tabAAfterResetLive = resetActiveModeSession(tabAReloaded, 'live', tabAStorage);
  assert.notEqual(tabAAfterResetLive.live.sessionId, tabASessions.live.sessionId);
  assert.equal(tabAAfterResetLive.demo.sessionId, tabASessions.demo.sessionId, 'Resetting Live must preserve Demo session');

  // Mode/Channel cross-contamination rejection
  assert.ok(
    validateModeScopedSessionIsolation(tabASessions.demo.sessionId, 'live', 'website'),
    '(D) Demo sessionId must be rejected on Live mode'
  );
  assert.ok(
    validateModeScopedSessionIsolation(tabASessions.live.sessionId, 'demo', 'website'),
    '(D) Live sessionId must be rejected on Demo mode'
  );
  assert.ok(
    validateModeScopedSessionIsolation('rec-wa-live-12345', 'live', 'website'),
    'WhatsApp sessionId must be isolated from website channel'
  );
  // Historical legacy IDs (e.g. rec-1de...) remain accepted to preserve historical data
  assert.equal(
    validateModeScopedSessionIsolation('rec-1de-legacy-0001', 'live', 'website'),
    null,
    '(I) Legacy historical sessionIds remain valid'
  );

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;

  try {
    // Seed a historical pre-existing record sharing legacy rec-1de... ID across live and demo (Scenario I)
    const legacyLive = await persistConversationMessages(
      {
        sessionId: 'rec-1de-legacy-9999',
        sessionToken: 'legacy_tok_live_1234567890',
        sourceChannel: 'website',
        sourceMode: 'live',
        currentPage: '/',
        detectedLanguage: 'en',
        messages: [
          {
            messageId: 'legacy-msg-1',
            senderType: 'customer',
            messageContent: 'Legacy Live customer message'
          }
        ]
      },
      process.env
    );
    const legacyDemo = await persistConversationMessages(
      {
        sessionId: 'rec-1de-legacy-9999',
        sessionToken: 'legacy_tok_demo_1234567890',
        sourceChannel: 'website',
        sourceMode: 'demo',
        currentPage: '/',
        detectedLanguage: 'en',
        messages: [
          {
            messageId: 'legacy-msg-2',
            senderType: 'customer',
            messageContent: 'Legacy Demo customer message'
          }
        ]
      },
      process.env
    );
    assert.notEqual(legacyLive.conversationId, legacyDemo.conversationId);

    // (D) HTTP rejects Demo session ID sent to Live endpoint and vice versa
    const crossModeChat = await originalFetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: tabAAfterResetLive.demo.sessionId,
        sessionToken: tabAAfterResetLive.demo.sessionToken,
        sourceChannel: 'website',
        sourceMode: 'live',
        mode: 'live',
        turnstileToken: 'tok-cross-mode-check',
        message: 'Attempting cross mode reuse',
        history: []
      })
    });
    assert.equal(crossModeChat.status, 400, '(D) API must reject Demo sessionId reused in Live mode');

    // Mock fetch for Live AI upstream calls (success & failure) while routing local HTTP calls normally
    let nextWorkerOutcome: 'success' | 'fail_503' | 'empty_reply' = 'success';
    let workerCallCount = 0;

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const targetUrl = String(input);
      if (targetUrl === CLOUDFLARE_RECEPTIONIST_CHAT_URL || targetUrl === CLOUDFLARE_CHAT_ENDPOINT) {
        workerCallCount += 1;
        if (nextWorkerOutcome === 'fail_503') {
          return new Response(JSON.stringify({ ok: false, error: 'Gemini upstream capacity exceeded' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        if (nextWorkerOutcome === 'empty_reply') {
          return new Response(JSON.stringify({ ok: true, reply: '   ', model: 'gemini-3.8-flash' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(
          JSON.stringify({
            ok: true,
            reply: `UNIKORN360 Live Gemini reply #${workerCallCount}: We build custom portals and GST software.`,
            model: 'gemini-3.8-flash'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (targetUrl.startsWith('/')) {
        return originalFetch(`${baseUrl}${targetUrl}`, init);
      }
      return originalFetch(input, init);
    };

    // (A) Tab A Demo Mode multi-turn conversation (never calls Live Worker)
    const workerBeforeDemo = workerCallCount;
    const demoTurn1 = await receptionistService.sendMessage({
      sessionId: tabAAfterResetLive.demo.sessionId,
      sessionToken: tabAAfterResetLive.demo.sessionToken,
      sourceChannel: 'website',
      sourceMode: 'demo',
      mode: 'demo',
      currentPage: '/services',
      clientMessageId: 'demo-u-1',
      assistantMessageId: 'demo-a-1',
      message: 'Tell me about website development',
      history: []
    });
    assert.equal(demoTurn1.persisted, true);
    assert.equal(demoTurn1.simulated, true);
    assert.equal(workerCallCount, workerBeforeDemo, 'Demo Mode must NEVER call Cloudflare/Gemini Live AI');

    // (E) Second turn in Tab A Demo reuses SAME session & conversation ID
    const demoTurn2 = await receptionistService.sendMessage({
      sessionId: tabAAfterResetLive.demo.sessionId,
      sessionToken: tabAAfterResetLive.demo.sessionToken,
      sourceChannel: 'website',
      sourceMode: 'demo',
      mode: 'demo',
      currentPage: '/products',
      clientMessageId: 'demo-u-2',
      assistantMessageId: 'demo-a-2',
      message: 'Show me InvoicePro360',
      history: [{ role: 'user', content: 'Tell me about website development' }]
    });
    assert.equal(demoTurn2.conversationId, demoTurn1.conversationId, '(E) Multi-turn demo must stay on same conversationId');

    // (B) & (F) Live AI success via /api/receptionist/chat stores BOTH customer & assistant against same conversationId
    nextWorkerOutcome = 'success';
    const liveChatRes1 = await originalFetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: tabAAfterResetLive.live.sessionId,
        sessionToken: tabAAfterResetLive.live.sessionToken,
        sourceChannel: 'website',
        sourceMode: 'live',
        mode: 'live',
        currentPage: '/products',
        turnstileToken: 'fresh-turnstile-token-live-1',
        clientMessageId: 'live-u-1',
        assistantMessageId: 'live-a-1',
        message: 'Can InvoicePro360 handle GST billing?',
        history: []
      })
    });
    assert.equal(liveChatRes1.status, 200);
    const liveJson1 = (await liveChatRes1.json()) as any;
    assert.equal(liveJson1.persisted, true);
    assert.ok(liveJson1.conversationId);
    assert.notEqual(liveJson1.conversationId, demoTurn1.conversationId);
    assert.equal(liveJson1.model, 'gemini-3.8-flash');

    // (F) Live AI failure (Gemini 503): must NOT fabricate assistant response AND must record failed system event
    nextWorkerOutcome = 'fail_503';
    const liveFailRes = await originalFetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: tabAAfterResetLive.live.sessionId,
        sessionToken: tabAAfterResetLive.live.sessionToken,
        sourceChannel: 'website',
        sourceMode: 'live',
        mode: 'live',
        currentPage: '/products',
        turnstileToken: 'fresh-turnstile-token-live-2',
        clientMessageId: 'live-u-fail-2',
        assistantMessageId: 'live-a-fail-2',
        message: 'Second turn while Gemini is down',
        history: []
      })
    });
    assert.equal(liveFailRes.status, 503, '(F) Must surface real Live AI upstream failure status');
    const liveFailJson = (await liveFailRes.json()) as any;
    assert.equal(liveFailJson.reply, undefined, '(F) Must NEVER fabricate an assistant reply on failure');
    assert.equal(liveFailJson.conversationId, liveJson1.conversationId);

    // Also verify production-origin direct Cloudflare client path records failure event cleanly on fail
    (globalThis as any).window = { location: { hostname: 'www.unikorn360.com' } };
    nextWorkerOutcome = 'empty_reply';
    let prodThrewEmpty = false;
    try {
      await receptionistService.sendMessage({
        sessionId: tabBSessions.live.sessionId,
        sessionToken: tabBSessions.live.sessionToken,
        sourceChannel: 'website',
        sourceMode: 'live',
        mode: 'live',
        currentPage: '/contact',
        turnstileToken: 'fresh-turnstile-token-tabB-1',
        clientMessageId: 'tabB-u-1',
        assistantMessageId: 'tabB-a-1',
        message: 'Tab B question when reply is empty',
        history: []
      });
    } catch (err: any) {
      prodThrewEmpty = err?.code === 'CLOUDFLARE_EMPTY_REPLY';
    }
    assert.ok(prodThrewEmpty, 'Production origin Live AI path must fail cleanly on empty Gemini reply');

    // (G) Duplicate retry with identical messageId must not duplicate messages
    nextWorkerOutcome = 'success';
    const dupRetryRes = await originalFetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: tabAAfterResetLive.live.sessionId,
        sessionToken: tabAAfterResetLive.live.sessionToken,
        sourceChannel: 'website',
        sourceMode: 'live',
        mode: 'live',
        currentPage: '/products',
        turnstileToken: 'fresh-turnstile-token-live-dup',
        clientMessageId: 'live-u-1',
        assistantMessageId: 'live-a-1',
        message: 'Can InvoicePro360 handle GST billing?',
        history: []
      })
    });
    assert.equal(dupRetryRes.status, 200);

    // (H) Page refresh hydration retrieves exact Demo and Live conversations independently
    const hydratedTabADemo = await originalFetch(
      `${baseUrl}/api/receptionist/messages?sessionId=${encodeURIComponent(tabAAfterResetLive.demo.sessionId)}&sourceChannel=website&sourceMode=demo`,
      { headers: { 'X-Receptionist-Session-Token': tabAAfterResetLive.demo.sessionToken } }
    );
    assert.equal(hydratedTabADemo.status, 200);
    const hydratedDemoJson = (await hydratedTabADemo.json()) as any;
    assert.equal(hydratedDemoJson.messages.length, 4, 'Tab A Demo should have 2 customer + 2 assistant turns');

    // Verify Admin Conversation Detail for Tab A Live, Tab B Live, and preserved Legacy rows (F, G, I)
    const adminListRes = await originalFetch(`${baseUrl}/api/admin/receptionist-conversations`, {
      headers: { Authorization: `Bearer ${TEST_TOKENS.admin}` }
    });
    assert.equal(adminListRes.status, 200);
    const adminListJson = (await adminListRes.json()) as any;
    const convIds = new Set(adminListJson.conversations.map((c: any) => c.id));
    assert.ok(convIds.has(legacyLive.conversationId), '(I) Legacy Live row preserved');
    assert.ok(convIds.has(legacyDemo.conversationId), '(I) Legacy Demo row preserved');
    assert.ok(convIds.has(demoTurn1.conversationId), 'Tab A Demo present in Admin Inbox');
    assert.ok(convIds.has(liveJson1.conversationId), 'Tab A Live present in Admin Inbox');

    const tabALiveDetailRes = await originalFetch(
      `${baseUrl}/api/admin/receptionist-conversations/${liveJson1.conversationId}`,
      { headers: { Authorization: `Bearer ${TEST_TOKENS.admin}` } }
    );
    assert.equal(tabALiveDetailRes.status, 200);
    const tabALiveDetail = (await tabALiveDetailRes.json()) as any;
    // Expected unique rows: live-u-1, live-a-1, live-u-fail-2, fail_live-a-fail-2 (4 total, no duplicate from retry)
    assert.equal(
      tabALiveDetail.messages.length,
      4,
      '(F/G) Tab A Live must hold customer+assistant turn + 1 failed attempt (customer+system failed) with zero duplicates'
    );
    const failedEvent = tabALiveDetail.messages.find((m: any) => m.delivery_status === 'failed');
    assert.ok(failedEvent, '(F) Failed Live AI attempt must be recorded with delivery_status=failed');
    assert.equal(failedEvent.sender_type, 'system');
    assert.equal(failedEvent.message_metadata.errorCode, 'CLOUDFLARE_BACKEND_ERROR');
    assert.equal(failedEvent.message_metadata.failureStage, 'upstream_ai');

    const tabBLiveSummary = adminListJson.conversations.find(
      (c: any) => c.session_id === tabBSessions.live.sessionId
    );
    assert.ok(tabBLiveSummary, 'Tab B Live must appear as separate conversation');
    assert.equal(tabBLiveSummary.failed_count, 1, 'Tab B Live failed empty reply must show failed_count=1');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = originalWindow;
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function main() {
  console.log('Running INBOX360 Stage 3 — Persistent Conversation CRM Verification Suite...\n');
  await runDatabaseMigrationAndRlsTests();
  await runSupabaseRestAdapterTest();
  await runHttpIntegrationTests();
  await runSessionIsolationAndFailurePersistenceTests();
  console.log('\nALL STAGE 3 & SESSION ISOLATION CONVERSATION CRM TESTS PASSED!');
}

main().catch((err) => {
  console.error('Stage 3 conversation CRM test failure:', err);
  process.exit(1);
});
