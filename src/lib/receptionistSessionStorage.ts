import {
  ReceptionistMode,
  ReceptionistSourceChannel
} from '../types/receptionist';

export interface StoredBrowserSession {
  sessionId: string;
  sessionToken: string;
  mode: ReceptionistMode;
  channel: ReceptionistSourceChannel;
}

export type ModeSessionPair = Record<ReceptionistMode, StoredBrowserSession>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function getModeSessionStorageKey(mode: ReceptionistMode): string {
  return `unikorn360_rec_session_v2:${mode}`;
}

export function generateSessionRandomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const rand2 = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}${rand2}`;
}

export function createModeScopedSession(
  mode: ReceptionistMode,
  channel: ReceptionistSourceChannel = 'website'
): StoredBrowserSession {
  const channelCode = channel === 'whatsapp' ? 'wa' : 'web';
  const modeCode = mode === 'demo' ? 'demo' : 'live';
  return {
    sessionId: generateSessionRandomId(`rec-${channelCode}-${modeCode}`),
    sessionToken: generateSessionRandomId(`sectok-${modeCode}`),
    mode,
    channel
  };
}

function getDefaultSessionStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function isValidStoredSessionForMode(
  raw: Partial<StoredBrowserSession> | null | undefined,
  mode: ReceptionistMode,
  channel: ReceptionistSourceChannel = 'website'
): raw is StoredBrowserSession {
  if (!raw || typeof raw.sessionId !== 'string' || typeof raw.sessionToken !== 'string') {
    return false;
  }
  const id = raw.sessionId.trim();
  const token = raw.sessionToken.trim();
  if (id.length < 16 || token.length < 16) return false;

  const expectedPrefix = `rec-${channel === 'whatsapp' ? 'wa' : 'web'}-${mode === 'demo' ? 'demo' : 'live'}-`;
  if (!id.startsWith(expectedPrefix)) {
    return false;
  }
  return true;
}

export function saveModeSession(
  session: StoredBrowserSession,
  storage: StorageLike | null = getDefaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(getModeSessionStorageKey(session.mode), JSON.stringify(session));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function loadOrCreateModeSession(
  mode: ReceptionistMode,
  storage: StorageLike | null = getDefaultSessionStorage(),
  channel: ReceptionistSourceChannel = 'website'
): StoredBrowserSession {
  if (storage) {
    try {
      const raw = storage.getItem(getModeSessionStorageKey(mode));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredBrowserSession>;
        if (isValidStoredSessionForMode(parsed, mode, channel)) {
          return {
            sessionId: parsed.sessionId,
            sessionToken: parsed.sessionToken,
            mode,
            channel
          };
        }
      }
    } catch {
      // Ignore parse/storage errors and create a fresh session
    }
  }

  const fresh = createModeScopedSession(mode, channel);
  saveModeSession(fresh, storage);
  return fresh;
}

export function loadOrCreateIsolatedTabSessions(
  storage: StorageLike | null = getDefaultSessionStorage()
): ModeSessionPair {
  const live = loadOrCreateModeSession('live', storage, 'website');
  let demo = loadOrCreateModeSession('demo', storage, 'website');

  if (demo.sessionId === live.sessionId) {
    demo = createModeScopedSession('demo', 'website');
    saveModeSession(demo, storage);
  }

  return { live, demo };
}

export function resetActiveModeSession(
  current: ModeSessionPair,
  activeMode: ReceptionistMode,
  storage: StorageLike | null = getDefaultSessionStorage()
): ModeSessionPair {
  const otherMode: ReceptionistMode = activeMode === 'live' ? 'demo' : 'live';
  let fresh = createModeScopedSession(activeMode, 'website');
  while (fresh.sessionId === current[otherMode].sessionId) {
    fresh = createModeScopedSession(activeMode, 'website');
  }
  saveModeSession(fresh, storage);
  return {
    ...current,
    [activeMode]: fresh
  };
}
