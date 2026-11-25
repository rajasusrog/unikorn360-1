import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { app } from '../server';
import { validateChatRequestPayload } from '../src/lib/receptionistKnowledge';
import {
  CLOUDFLARE_TURNSTILE_SCRIPT_SRC,
  CLOUDFLARE_TURNSTILE_SITE_KEY,
  TurnstileApi,
  TurnstileChallengeController,
  TurnstileRenderOptions,
  TurnstileVerificationError,
  formatTurnstileErrorMessage,
  isRegisteredTurnstileHost
} from '../src/lib/turnstile';
import { ReceptionistClientError, receptionistService } from '../src/services/receptionistService';

async function runTests() {
  console.log('Running Cloudflare Turnstile integration verification suite...');

  // 1. Verify official Turnstile script tag is present in index.html head and secret key is never exposed
  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  assert.ok(
    indexHtml.includes(`<script src="${CLOUDFLARE_TURNSTILE_SCRIPT_SRC}" async defer></script>`),
    'index.html must load Cloudflare official Turnstile explicit-render script in head'
  );
  assert.equal(CLOUDFLARE_TURNSTILE_SITE_KEY, '0x4AAAAAAGSQqxgKT3aGSBca');

  const srcFilesToCheck = [
    'src/lib/turnstile.ts',
    'src/services/receptionistService.ts',
    'src/components/ReceptionistWidget.tsx',
    'src/lib/receptionistKnowledge.ts'
  ];
  for (const relPath of srcFilesToCheck) {
    const content = fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf8');
    assert.ok(
      !content.includes('TURNSTILE_SECRET') && !content.includes('0x4AAAAAAGSQqxh'),
      `Frontend file ${relPath} must never contain Turnstile secret key`
    );
  }

  // 2. Verify production domain check does not weaken or accept arbitrary preview domains
  assert.equal(isRegisteredTurnstileHost('unikorn360.com'), true);
  assert.equal(isRegisteredTurnstileHost('www.unikorn360.com'), true);
  assert.equal(isRegisteredTurnstileHost('evil-unikorn360.com'), false);
  assert.equal(isRegisteredTurnstileHost('localhost'), false);
  assert.ok(
    formatTurnstileErrorMessage('110200').includes('www.unikorn360.com'),
    'Domain error 110200 should explain registered production domains clearly'
  );

  // 3. Verify explicit TurnstileChallengeController lifecycle (render, execute, single-use reset, errors)
  let capturedOptions: TurnstileRenderOptions | null = null;
  let executeCount = 0;
  let resetCount = 0;
  let removeCount = 0;
  let nextOutcome:
    | { type: 'token'; value: string }
    | { type: 'expired' }
    | { type: 'error'; code: string }
    | { type: 'timeout' } = { type: 'token', value: 'token-round-1' };

  const mockTurnstileApi: TurnstileApi = {
    render(_container, options) {
      capturedOptions = options;
      return 'widget-1';
    },
    execute() {
      executeCount += 1;
      queueMicrotask(() => {
        if (!capturedOptions) return;
        if (nextOutcome.type === 'token') {
          capturedOptions.callback?.(nextOutcome.value);
        } else if (nextOutcome.type === 'expired') {
          capturedOptions['expired-callback']?.();
        } else if (nextOutcome.type === 'error') {
          capturedOptions['error-callback']?.(nextOutcome.code);
        } else if (nextOutcome.type === 'timeout') {
          capturedOptions['timeout-callback']?.();
        }
      });
    },
    reset() {
      resetCount += 1;
    },
    remove() {
      removeCount += 1;
    },
    getResponse() {
      return undefined;
    }
  };

  const controller = new TurnstileChallengeController({
    getApi: () => mockTurnstileApi,
    challengeTimeoutMs: 5000
  });
  const fakeContainer = {} as HTMLElement;

  const widgetId = await controller.mount(fakeContainer);
  assert.equal(widgetId, 'widget-1');
  assert.equal(controller.isMounted(), true);
  assert.equal(capturedOptions?.sitekey, '0x4AAAAAAGSQqxgKT3aGSBca');
  assert.equal(capturedOptions?.execution, 'execute');
  assert.equal(capturedOptions?.appearance, 'interaction-only');

  // Execute #1 -> obtains fresh single-use token
  nextOutcome = { type: 'token', value: 'fresh-token-1' };
  const token1 = await controller.executeFreshChallenge();
  assert.equal(token1, 'fresh-token-1');
  assert.equal(executeCount, 1);

  // Explicit single-use reset after request, then Execute #2 -> obtains fresh distinct token
  controller.reset();
  assert.equal(resetCount, 1);

  nextOutcome = { type: 'token', value: 'fresh-token-2' };
  const token2 = await controller.executeFreshChallenge();
  assert.equal(token2, 'fresh-token-2');
  assert.notEqual(token2, token1);
  assert.equal(executeCount, 2);

  // Even if caller forgets reset() before next execute, controller auto-resets spent widget before executing
  nextOutcome = { type: 'token', value: 'fresh-token-3' };
  const token3 = await controller.executeFreshChallenge();
  assert.equal(token3, 'fresh-token-3');
  assert.equal(resetCount, 2, 'Controller must automatically reset spent widget before executing again');

  // Expiration handling
  nextOutcome = { type: 'expired' };
  await assert.rejects(
    () => controller.executeFreshChallenge(),
    (err: unknown) =>
      err instanceof TurnstileVerificationError && err.code === 'TURNSTILE_EXPIRED'
  );

  // Error handling (e.g. Cloudflare error 110200 or challenge error)
  nextOutcome = { type: 'error', code: '600010' };
  await assert.rejects(
    () => controller.executeFreshChallenge(),
    (err: unknown) =>
      err instanceof TurnstileVerificationError &&
      err.code === 'TURNSTILE_FAILED' &&
      err.rawErrorCode === '600010'
  );

  // Timeout callback handling
  nextOutcome = { type: 'timeout' };
  await assert.rejects(
    () => controller.executeFreshChallenge(),
    (err: unknown) =>
      err instanceof TurnstileVerificationError && err.code === 'TURNSTILE_TIMEOUT'
  );

  // Recovery retry after failures succeeds cleanly
  nextOutcome = { type: 'token', value: 'recovered-token-4' };
  const token4 = await controller.executeFreshChallenge();
  assert.equal(token4, 'recovered-token-4');

  // Destroy cleans up mounted widget
  controller.destroy();
  assert.equal(removeCount, 1);
  assert.equal(controller.isMounted(), false);

  // 4. Verify client service never calls Live AI without turnstileToken, while Demo Mode remains separate
  let rejectedEmptyToken = false;
  try {
    await receptionistService.sendMessage({
      sessionId: 'client-test-1',
      message: 'Tell me about website development',
      history: [],
      mode: 'live',
      turnstileToken: ''
    });
  } catch (err) {
    rejectedEmptyToken =
      err instanceof ReceptionistClientError &&
      err.status === 400 &&
      err.code === 'TURNSTILE_TOKEN_REQUIRED';
  }
  assert.ok(rejectedEmptyToken, 'receptionistService.sendMessage must reject Live AI without Turnstile token');

  const demoResp = await receptionistService.sendMessage({
    sessionId: 'client-demo-1',
    message: 'Tell me about WhatsApp automation',
    history: [],
    mode: 'demo'
  });
  assert.equal(demoResp.mode, 'demo');
  assert.equal(demoResp.simulated, true);

  // 5. Verify validator enforces turnstileToken strictly on live mode and allows demo mode without it
  const missingTokenValidation = validateChatRequestPayload({
    sessionId: 'val-1',
    message: 'How can UNIKORN360 help my business?',
    history: [],
    mode: 'live'
  });
  assert.equal(missingTokenValidation.ok, false);

  const demoValidation = validateChatRequestPayload({
    sessionId: 'val-2',
    message: 'How can UNIKORN360 help my business?',
    history: [],
    mode: 'demo'
  });
  assert.equal(demoValidation.ok, true);

  // 6. Verify HTTP POST /api/receptionist/chat returns 400 in Live mode without turnstileToken
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  assert.ok(addr && typeof addr === 'object');
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    const liveNoTokenRes = await fetch(`${baseUrl}/api/receptionist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'http-turnstile-check',
        message: 'Do you build custom ERP software?',
        history: [],
        mode: 'live'
      })
    });
    assert.equal(liveNoTokenRes.status, 400);
    const body = (await liveNoTokenRes.json()) as { error?: string };
    assert.ok(String(body.error || '').toLowerCase().includes('turnstile'));
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('ALL TURNSTILE INTEGRATION TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('Turnstile test failure:', err);
  process.exit(1);
});
