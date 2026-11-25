/**
 * Cloudflare Turnstile explicit-rendering controller for UNIKORN360 AI Receptionist.
 * Only uses the public Turnstile site key. Never contains any secret key.
 */

export const CLOUDFLARE_TURNSTILE_SITE_KEY = '0x4AAAAAAGSQqxgKT3aGSBca';
export const CLOUDFLARE_TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
export const TURNSTILE_PRODUCTION_HOSTS = ['unikorn360.com', 'www.unikorn360.com'] as const;

export interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  execution?: 'render' | 'execute';
  appearance?: 'always' | 'execute' | 'interaction-only';
  callback?: (token: string) => void;
  'error-callback'?: (errorCode?: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

export interface TurnstileApi {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  execute: (containerOrWidgetId: HTMLElement | string, options?: Partial<TurnstileRenderOptions>) => void;
  reset: (containerOrWidgetId?: HTMLElement | string) => void;
  remove: (containerOrWidgetId?: HTMLElement | string) => void;
  getResponse: (containerOrWidgetId?: HTMLElement | string) => string | undefined;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export class TurnstileVerificationError extends Error {
  public readonly code:
    | 'TURNSTILE_UNAVAILABLE'
    | 'TURNSTILE_EXPIRED'
    | 'TURNSTILE_FAILED'
    | 'TURNSTILE_TIMEOUT'
    | 'TURNSTILE_CANCELLED';
  public readonly rawErrorCode?: string;

  constructor(
    message: string,
    code:
      | 'TURNSTILE_UNAVAILABLE'
      | 'TURNSTILE_EXPIRED'
      | 'TURNSTILE_FAILED'
      | 'TURNSTILE_TIMEOUT'
      | 'TURNSTILE_CANCELLED',
    rawErrorCode?: string
  ) {
    super(message);
    this.name = 'TurnstileVerificationError';
    this.code = code;
    this.rawErrorCode = rawErrorCode;
  }
}

export function isRegisteredTurnstileHost(hostname?: string): boolean {
  const host = (
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  )
    .toLowerCase()
    .trim();
  return host === 'unikorn360.com' || host === 'www.unikorn360.com';
}

export function formatTurnstileErrorMessage(rawErrorCode?: string): string {
  const code = String(rawErrorCode || '').trim();
  if (code.startsWith('110200') && !isRegisteredTurnstileHost()) {
    return 'Security verification (Cloudflare Turnstile) only validates on www.unikorn360.com and unikorn360.com. You can preview replies using Demo Mode here.';
  }
  if (code) {
    return `Security verification failed (Turnstile code ${code}). Please retry to verify your session.`;
  }
  return 'Security verification could not be completed. Please retry to verify your session.';
}

export async function waitForTurnstileApi(
  timeoutMs = 8000,
  getApi: () => TurnstileApi | undefined = () =>
    typeof window !== 'undefined' ? window.turnstile : undefined
): Promise<TurnstileApi> {
  const existing = getApi();
  if (existing && typeof existing.render === 'function') {
    return existing;
  }

  if (typeof document !== 'undefined') {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = CLOUDFLARE_TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const api = getApi();
    if (api && typeof api.render === 'function') {
      return api;
    }
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  throw new TurnstileVerificationError(
    'Cloudflare Turnstile security script did not finish loading. Please check your connection or disable script blockers and retry.',
    'TURNSTILE_UNAVAILABLE'
  );
}

interface PendingChallenge {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
  timerId: ReturnType<typeof setTimeout>;
}

/**
 * Manages a single explicit Managed Turnstile widget instance with strict
 * per-request challenge execution and single-use reset after every request.
 */
export class TurnstileChallengeController {
  private readonly getApi: () => TurnstileApi | undefined;
  private readonly siteKey: string;
  private readonly challengeTimeoutMs: number;
  private widgetId: string | null = null;
  private container: HTMLElement | null = null;
  private needsResetBeforeExecute = false;
  private pending: PendingChallenge | null = null;

  constructor(options?: {
    siteKey?: string;
    challengeTimeoutMs?: number;
    getApi?: () => TurnstileApi | undefined;
  }) {
    this.siteKey = options?.siteKey || CLOUDFLARE_TURNSTILE_SITE_KEY;
    this.challengeTimeoutMs = options?.challengeTimeoutMs ?? 45_000;
    this.getApi =
      options?.getApi ||
      (() => (typeof window !== 'undefined' ? window.turnstile : undefined));
  }

  public isMounted(): boolean {
    return this.widgetId !== null;
  }

  public async mount(container: HTMLElement): Promise<string> {
    if (this.widgetId && this.container === container) {
      return this.widgetId;
    }

    if (this.widgetId) {
      this.destroy();
    }

    const api = await waitForTurnstileApi(8000, this.getApi);
    this.container = container;
    this.needsResetBeforeExecute = false;

    this.widgetId = api.render(container, {
      sitekey: this.siteKey,
      theme: 'light',
      execution: 'execute',
      appearance: 'interaction-only',
      callback: (token: string) => {
        const cleanToken = typeof token === 'string' ? token.trim() : '';
        if (!cleanToken) {
          this.rejectPending(
            new TurnstileVerificationError(
              'Security verification returned an empty token. Please retry.',
              'TURNSTILE_FAILED'
            )
          );
          this.needsResetBeforeExecute = true;
          return;
        }
        this.needsResetBeforeExecute = true;
        this.resolvePending(cleanToken);
      },
      'expired-callback': () => {
        this.needsResetBeforeExecute = true;
        this.rejectPending(
          new TurnstileVerificationError(
            'Your security verification expired. Please retry sending your message.',
            'TURNSTILE_EXPIRED'
          )
        );
      },
      'error-callback': (errorCode?: string) => {
        this.needsResetBeforeExecute = true;
        this.rejectPending(
          new TurnstileVerificationError(
            formatTurnstileErrorMessage(errorCode),
            'TURNSTILE_FAILED',
            errorCode
          )
        );
      },
      'timeout-callback': () => {
        this.needsResetBeforeExecute = true;
        this.rejectPending(
          new TurnstileVerificationError(
            'Security verification timed out before completion. Please retry.',
            'TURNSTILE_TIMEOUT'
          )
        );
      }
    });

    return this.widgetId;
  }

  public async executeFreshChallenge(container?: HTMLElement | null): Promise<string> {
    if (this.pending) {
      throw new TurnstileVerificationError(
        'A security verification challenge is already in progress.',
        'TURNSTILE_FAILED'
      );
    }

    if (!this.widgetId) {
      if (!container) {
        throw new TurnstileVerificationError(
          'Security verification widget is not ready yet. Please try again.',
          'TURNSTILE_UNAVAILABLE'
        );
      }
      await this.mount(container);
    }

    const api = this.getApi();
    if (!api || !this.widgetId) {
      throw new TurnstileVerificationError(
        'Cloudflare Turnstile API is currently unavailable.',
        'TURNSTILE_UNAVAILABLE'
      );
    }

    const activeWidgetId = this.widgetId;

    // Ensure a spent, expired, or failed widget is reset cleanly so a brand-new single-use token is generated.
    if (this.needsResetBeforeExecute) {
      try {
        api.reset(activeWidgetId);
      } catch {
        // Ignore reset failure prior to fresh execute
      }
      this.needsResetBeforeExecute = false;
    }

    return new Promise<string>((resolve, reject) => {
      const timerId = setTimeout(() => {
        this.needsResetBeforeExecute = true;
        this.rejectPending(
          new TurnstileVerificationError(
            'Security verification timed out. Please retry sending your message.',
            'TURNSTILE_TIMEOUT'
          )
        );
      }, this.challengeTimeoutMs);

      this.pending = { resolve, reject, timerId };

      try {
        api.execute(activeWidgetId);
      } catch (err) {
        this.needsResetBeforeExecute = true;
        this.rejectPending(
          new TurnstileVerificationError(
            err instanceof Error
              ? err.message
              : 'Unable to execute Cloudflare Turnstile verification.',
            'TURNSTILE_FAILED'
          )
        );
      }
    });
  }

  /**
   * Resets the Turnstile widget after every request because tokens are single-use.
   */
  public reset(): void {
    const api = this.getApi();
    this.needsResetBeforeExecute = false;
    if (api && this.widgetId) {
      try {
        api.reset(this.widgetId);
      } catch {
        // Ignore reset errors if widget was already removed
      }
    }
  }

  public destroy(): void {
    this.rejectPending(
      new TurnstileVerificationError(
        'Security verification was cancelled.',
        'TURNSTILE_CANCELLED'
      )
    );
    const api = this.getApi();
    if (api && this.widgetId) {
      try {
        api.remove(this.widgetId);
      } catch {
        // Ignore DOM removal errors
      }
    }
    this.widgetId = null;
    this.container = null;
    this.needsResetBeforeExecute = false;
  }

  private resolvePending(token: string): void {
    if (!this.pending) return;
    const { resolve, timerId } = this.pending;
    this.pending = null;
    clearTimeout(timerId);
    resolve(token);
  }

  private rejectPending(err: Error): void {
    if (!this.pending) return;
    const { reject, timerId } = this.pending;
    this.pending = null;
    clearTimeout(timerId);
    reject(err);
  }
}
