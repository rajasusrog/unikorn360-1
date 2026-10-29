import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ServiceDivision, 
  ServiceCatalogItem, 
  ServiceRelation, 
  ServicePackage,
  RecordStatus
} from '../types/database';
import { 
  SEED_DIVISIONS, 
  SEED_SERVICES, 
  LEGACY_URL_REDIRECTS 
} from '../data/seedData';

const envObj: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined'
    ? process.env
    : {};

const supabaseUrl = (envObj.VITE_SUPABASE_URL || envObj.SUPABASE_URL || '').trim();
const rawPublishableKey = (
  envObj.VITE_SUPABASE_PUBLISHABLE_KEY ||
  envObj.VITE_SUPABASE_ANON_KEY ||
  envObj.SUPABASE_PUBLISHABLE_KEY ||
  envObj.SUPABASE_ANON_KEY ||
  ''
).trim();

// Never allow a secret key in the browser client
const supabasePublishableKey = rawPublishableKey.startsWith('sb_secret_') ? '' : rawPublishableKey;

export const isRemoteSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('example.com') &&
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isRemoteSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Local Storage Persistence Keys - Bumped to v4 for 6-division, 37-service architecture
const LOCAL_DIVISIONS_KEY = 'unikorn360_service_divisions_v4';
const LOCAL_CATALOG_KEY = 'unikorn360_service_catalog_v4';
const LOCAL_RELATIONS_KEY = 'unikorn360_service_relations_v4';

const OBSOLETE_AUTH_STORAGE_KEYS = [
  'unikorn360_admin_token',
  'unikorn360_admin_pin',
  'unikorn360_admin_session'
];

export function purgeObsoleteAuthStorageKeys(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    for (const key of OBSOLETE_AUTH_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
}

export interface SupabaseAuthLikeClient {
  auth: {
    getSession: () => Promise<{
      data: { session: { access_token?: string } | null } | null;
      error: { message?: string } | null;
    }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { session: { access_token?: string } | null; user?: any } | null;
      error: { message?: string } | null;
    }>;
    signOut: (options?: { scope?: 'global' | 'local' | 'others' }) => Promise<{
      error: { message?: string } | null;
    }>;
    onAuthStateChange: (
      callback: (event: string, session: { access_token?: string } | null) => void
    ) => { data: { subscription: { unsubscribe: () => void } } };
  };
}

export interface VerifiedAdminSession {
  user: { id: string; email: string };
  role: 'superadmin' | 'admin' | 'evaluator';
  accessToken: string;
}

export interface AdminSessionCheckResult {
  status: 'authenticated' | 'unauthenticated' | 'forbidden' | 'error' | 'unconfigured';
  session?: VerifiedAdminSession;
  user?: { id: string; email: string };
  role?: 'superadmin' | 'admin' | 'evaluator';
  accessToken?: string;
  error?: string;
}

/**
 * Resilient Database & Session Layer
 * Uses Supabase SDK-managed session persistence & automatic token refresh,
 * paired with server-side administrator membership verification via /api/admin/auth/me.
 */
export class ResilientServicesService {
  private divisions: ServiceDivision[] = [];
  private catalog: ServiceCatalogItem[] = [];
  private relations: ServiceRelation[] = [];
  private initialized = false;
  private authClient: SupabaseAuthLikeClient | null;
  private fetchImpl: typeof fetch;

  constructor(
    optionsOrClient?:
      | { authClient?: SupabaseAuthLikeClient | null; fetchImpl?: typeof fetch }
      | SupabaseAuthLikeClient
      | null,
    customFetch?: typeof fetch
  ) {
    if (
      optionsOrClient &&
      typeof optionsOrClient === 'object' &&
      ('authClient' in optionsOrClient || 'fetchImpl' in optionsOrClient)
    ) {
      this.authClient = optionsOrClient.authClient !== undefined ? optionsOrClient.authClient : (supabase as unknown as SupabaseAuthLikeClient | null);
      this.fetchImpl = optionsOrClient.fetchImpl || ((...args: Parameters<typeof fetch>) => fetch(...args));
    } else {
      this.authClient = optionsOrClient !== undefined ? (optionsOrClient as SupabaseAuthLikeClient | null) : (supabase as unknown as SupabaseAuthLikeClient | null);
      this.fetchImpl = customFetch || ((...args: Parameters<typeof fetch>) => fetch(...args));
    }
    purgeObsoleteAuthStorageKeys();
    this.initLocalStore();
  }

  private async requireCatalogAdmin(): Promise<{ user: any; role: 'superadmin' | 'admin' }> {
    const session = await this.getCurrentAdminSession();
    if (!session) {
      throw new Error('Authentication required: Please sign in as an administrator.');
    }
    if (session.role !== 'superadmin' && session.role !== 'admin') {
      throw new Error('Permission denied: Only superadmin and admin roles can manage the service catalogue.');
    }
    return { user: session.user, role: session.role };
  }

  private initLocalStore() {
    if (typeof window === 'undefined') {
      this.divisions = [...SEED_DIVISIONS];
      this.catalog = [...SEED_SERVICES];
      return;
    }

    try {
      const storedDivisions = localStorage.getItem(LOCAL_DIVISIONS_KEY);
      const storedCatalog = localStorage.getItem(LOCAL_CATALOG_KEY);
      const storedRelations = localStorage.getItem(LOCAL_RELATIONS_KEY);

      let needsReseed = false;

      if (storedDivisions) {
        const parsed = JSON.parse(storedDivisions);
        const hasLegacySlugs = parsed.some((d: ServiceDivision) => 
          ['build', 'secure', 'grow', 'influence', 'automate', 'intelligence', 'business-support', 'consulting-education'].includes(d.slug)
        );
        if (!Array.isArray(parsed) || parsed.length !== 6 || hasLegacySlugs) {
          needsReseed = true;
        } else {
          this.divisions = parsed;
        }
      } else {
        needsReseed = true;
      }

      if (storedCatalog) {
        const parsedCatalog = JSON.parse(storedCatalog);
        if (!Array.isArray(parsedCatalog) || parsedCatalog.length !== SEED_SERVICES.length || needsReseed) {
          needsReseed = true;
        } else {
          this.catalog = parsedCatalog;
        }
      } else {
        needsReseed = true;
      }

      if (needsReseed) {
        this.divisions = [...SEED_DIVISIONS];
        this.catalog = [...SEED_SERVICES];
        localStorage.setItem(LOCAL_DIVISIONS_KEY, JSON.stringify(this.divisions));
        localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(this.catalog));
      }

      if (storedRelations) {
        this.relations = JSON.parse(storedRelations);
      } else {
        this.relations = [];
      }
      this.initialized = true;
    } catch {
      this.divisions = [...SEED_DIVISIONS];
      this.catalog = [...SEED_SERVICES];
      this.relations = [];
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_DIVISIONS_KEY, JSON.stringify(this.divisions));
      localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(this.catalog));
      localStorage.setItem(LOCAL_RELATIONS_KEY, JSON.stringify(this.relations));
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }

  // --- SDK-Managed Auth & Backend Membership Verification ---

  /**
   * Obtains the current SDK-managed access token (automatically refreshed by @supabase/supabase-js).
   */
  public async getAccessToken(): Promise<string | null> {
    purgeObsoleteAuthStorageKeys();
    if (!this.authClient) return null;
    try {
      const { data, error } = await this.authClient.auth.getSession();
      if (error || !data?.session?.access_token) {
        return null;
      }
      return data.session.access_token;
    } catch {
      return null;
    }
  }

  /**
   * Signs in with email & password via the browser Supabase SDK (`signInWithPassword`),
   * then verifies administrator membership through `/api/admin/auth/me`.
   * If membership is missing or invalid, signs out immediately and returns the rejection status.
   */
  public async signInAdmin(
    email: string,
    password: string
  ): Promise<AdminSessionCheckResult> {
    purgeObsoleteAuthStorageKeys();
    if (!this.authClient) {
      return {
        status: 'unconfigured',
        error: 'Supabase Authentication is not configured in this environment.'
      };
    }

    try {
      const { data, error } = await this.authClient.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error || !data?.session?.access_token) {
        return {
          status: 'unauthenticated',
          error: error?.message || 'Invalid administrator email or password.'
        };
      }

      const verification = await this.verifyTokenWithBackend(data.session.access_token);
      if (verification.status === 'authenticated') {
        return verification;
      }

      // verifyTokenWithBackend already triggers signOut on 401/403, ensure clean signOut on any non-authenticated result
      await this.authClient.auth.signOut({ scope: 'local' }).catch(() => {});
      return verification;
    } catch (err: any) {
      return {
        status: 'error',
        error: err?.message || 'Network error while attempting administrator sign-in.'
      };
    }
  }

  /**
   * Verifies a specific SDK access token against the protected `/api/admin/auth/me` backend endpoint.
   */
  public async verifyTokenWithBackend(accessToken: string): Promise<AdminSessionCheckResult> {
    if (!accessToken) {
      return { status: 'unauthenticated' };
    }

    try {
      const res = await this.fetchImpl('/api/admin/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        if (this.authClient) {
          await this.authClient.auth.signOut({ scope: 'local' }).catch(() => {});
        }
        return {
          status: 'unauthenticated',
          error: body.error || 'Session expired or invalid. Please sign in again.'
        };
      }

      if (res.status === 403) {
        if (this.authClient) {
          await this.authClient.auth.signOut({ scope: 'local' }).catch(() => {});
        }
        return {
          status: 'forbidden',
          error: body.error || 'Access Denied: Your account does not have administrator privileges in creator_admin_users.'
        };
      }

      if (!res.ok) {
        return {
          status: 'error',
          error: body.error || `Administrator verification unavailable (HTTP ${res.status}).`
        };
      }

      if (!body.user || !['superadmin', 'admin', 'evaluator'].includes(body.role)) {
        if (this.authClient) {
          await this.authClient.auth.signOut({ scope: 'local' }).catch(() => {});
        }
        return {
          status: 'forbidden',
          error: 'Invalid administrator membership response from server.'
        };
      }

      const verifiedSession: VerifiedAdminSession = {
        user: body.user,
        role: body.role,
        accessToken
      };

      return {
        status: 'authenticated',
        session: verifiedSession,
        user: body.user,
        role: body.role,
        accessToken
      };
    } catch {
      return {
        status: 'error',
        error: 'Network error while verifying administrator session with server.'
      };
    }
  }

  /**
   * Checks current SDK session and verifies membership with the backend.
   */
  public async verifyAdminSession(): Promise<AdminSessionCheckResult> {
    purgeObsoleteAuthStorageKeys();
    if (!this.authClient) {
      return {
        status: 'unconfigured',
        error: 'Supabase authentication client is not configured.'
      };
    }

    let accessToken: string | null = null;
    try {
      const { data, error } = await this.authClient.auth.getSession();
      if (error) {
        await this.authClient.auth.signOut({ scope: 'local' }).catch(() => {});
        return { status: 'unauthenticated', error: error.message };
      }
      accessToken = data?.session?.access_token || null;
    } catch {
      return {
        status: 'error',
        error: 'Failed to read authentication session from Supabase client.'
      };
    }

    if (!accessToken) {
      return { status: 'unauthenticated' };
    }

    return this.verifyTokenWithBackend(accessToken);
  }

  public async getCurrentAdminSession(): Promise<{ user: any; role: 'superadmin' | 'admin' | 'evaluator' } | null> {
    const result = await this.verifyAdminSession();
    if (result.status === 'authenticated' && result.session) {
      return { user: result.session.user, role: result.session.role };
    }
    return null;
  }

  /**
   * Subscribes to Supabase auth state events (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
   * and verifies the active session token with the backend before notifying the subscriber.
   */
  public onAdminAuthStateChange(
    callback: (result: AdminSessionCheckResult, event: string) => void
  ): () => void {
    if (!this.authClient) return () => {};
    const { data } = this.authClient.auth.onAuthStateChange(async (event, session) => {
      purgeObsoleteAuthStorageKeys();
      if (event === 'SIGNED_OUT' || !session?.access_token) {
        callback({ status: 'unauthenticated' }, event);
        return;
      }
      const verified = await this.verifyTokenWithBackend(session.access_token);
      callback(verified, event);
    });
    return () => {
      data?.subscription?.unsubscribe();
    };
  }

  /**
   * Awaits the Supabase SDK sign-out operation, clears obsolete local state,
   * and accurately reports any sign-out failure.
   */
  public async logoutAdmin(): Promise<{ success: boolean; error?: string }> {
    purgeObsoleteAuthStorageKeys();
    if (!this.authClient) {
      return { success: true };
    }

    try {
      const { error } = await this.authClient.auth.signOut();
      if (error) {
        return {
          success: false,
          error: error.message || 'Supabase sign-out returned an error.'
        };
      }
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Unexpected error during sign-out.'
      };
    }
  }

  // --- Divisions ---
  public async getDivisions(options?: { includeDrafts?: boolean }): Promise<ServiceDivision[]> {
    const includeDrafts = options?.includeDrafts ?? false;

    // Filter divisions based on status
    const filteredDivisions = this.divisions
      .filter(d => includeDrafts || d.status === 'published')
      .sort((a, b) => a.display_order - b.display_order);

    // Compute dynamic public count of published services per division
    return filteredDivisions.map(div => {
      const publishedCount = this.catalog.filter(
        s => s.division_id === div.id && s.status === 'published'
      ).length;

      return {
        ...div,
        published_service_count: publishedCount
      };
    });
  }

  public async getDivisionBySlug(
    slug: string, 
    options?: { includeDrafts?: boolean }
  ): Promise<{ division: ServiceDivision; services: ServiceCatalogItem[] } | null> {
    const normalizedSlug = slug.toLowerCase().trim();
    const includeDrafts = options?.includeDrafts ?? false;

    const division = this.divisions.find(d => d.slug.toLowerCase() === normalizedSlug);
    if (!division) return null;

    if (!includeDrafts && division.status !== 'published') {
      return null; // RLS: Public cannot view unpublished division
    }

    const services = this.catalog
      .filter(s => s.division_id === division.id && (includeDrafts || s.status === 'published'))
      .sort((a, b) => a.display_order - b.display_order);

    return {
      division: {
        ...division,
        published_service_count: this.catalog.filter(
          s => s.division_id === division.id && s.status === 'published'
        ).length
      },
      services
    };
  }

  // --- Services ---
  public async getServiceByDivisionAndSlug(
    divisionSlug: string,
    serviceSlug: string,
    options?: { includeDrafts?: boolean }
  ): Promise<{
    service: ServiceCatalogItem;
    division: ServiceDivision;
    relatedServices: ServiceCatalogItem[];
  } | null> {
    const divResult = await this.getDivisionBySlug(divisionSlug, options);
    if (!divResult) return null;

    const { division } = divResult;
    const normalizedServiceSlug = serviceSlug.toLowerCase().trim();
    const includeDrafts = options?.includeDrafts ?? false;

    // Match exact slug or legacy alias
    const service = this.catalog.find(
      s => s.division_id === division.id && 
           (s.slug.toLowerCase() === normalizedServiceSlug || 
            (s.legacy_slugs && s.legacy_slugs.some(ls => ls.toLowerCase() === normalizedServiceSlug)))
    );

    if (!service) return null;

    // RLS: Public cannot view draft or archived service
    if (!includeDrafts && service.status !== 'published') {
      return null;
    }

    // Get related published services
    const relatedServices = this.catalog
      .filter(s => s.division_id === division.id && s.id !== service.id && s.status === 'published')
      .slice(0, 3);

    return {
      service,
      division,
      relatedServices
    };
  }

  public async getAllPublishedServices(): Promise<ServiceCatalogItem[]> {
    // Only return services where both service AND parent division are published
    const publishedDivisionIds = new Set(
      this.divisions.filter(d => d.status === 'published').map(d => d.id)
    );

    return this.catalog
      .filter(s => s.status === 'published' && publishedDivisionIds.has(s.division_id))
      .sort((a, b) => a.display_order - b.display_order);
  }

  public async getAllServicesForAdmin(): Promise<{
    services: (ServiceCatalogItem & { division_name: string; division_slug: string })[];
    divisions: ServiceDivision[];
    stats: {
      totalServices: number;
      publishedServices: number;
      draftServices: number;
      archivedServices: number;
    };
  }> {
    await this.requireCatalogAdmin();
    const divisionMap = new Map(this.divisions.map(d => [d.id, d]));

    const enrichedServices = this.catalog.map(s => {
      const parent = divisionMap.get(s.division_id);
      return {
        ...s,
        division_name: parent?.name || 'Unknown Division',
        division_slug: parent?.slug || 'unknown'
      };
    });

    const stats = {
      totalServices: this.catalog.length,
      publishedServices: this.catalog.filter(s => s.status === 'published').length,
      draftServices: this.catalog.filter(s => s.status === 'draft').length,
      archivedServices: this.catalog.filter(s => s.status === 'archived').length
    };

    return {
      services: enrichedServices,
      divisions: this.divisions,
      stats
    };
  }

  // --- CRUD Operations (Protected for Admin & Superadmin Only) ---
  public async createService(
    serviceData: Omit<ServiceCatalogItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ServiceCatalogItem> {
    await this.requireCatalogAdmin();
    // Validate unique slug within division
    const existing = this.catalog.find(
      s => s.division_id === serviceData.division_id && 
           s.slug.toLowerCase() === serviceData.slug.toLowerCase()
    );

    if (existing) {
      throw new Error(`A service with slug "${serviceData.slug}" already exists in this division.`);
    }

    const newId = `srv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newService: ServiceCatalogItem = {
      ...serviceData,
      id: newId,
      created_at: now,
      updated_at: now,
      published_at: serviceData.status === 'published' ? now : null
    };

    this.catalog.push(newService);
    this.persist();
    return newService;
  }

  public async updateService(
    id: string,
    updates: Partial<ServiceCatalogItem>
  ): Promise<ServiceCatalogItem> {
    await this.requireCatalogAdmin();
    const index = this.catalog.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Service with ID ${id} not found.`);
    }

    const current = this.catalog[index];

    // Check slug collision if slug changed
    if (updates.slug && updates.slug.toLowerCase() !== current.slug.toLowerCase()) {
      const divId = updates.division_id || current.division_id;
      const collision = this.catalog.find(
        s => s.id !== id && s.division_id === divId && s.slug.toLowerCase() === updates.slug!.toLowerCase()
      );
      if (collision) {
        throw new Error(`A service with slug "${updates.slug}" already exists in this division.`);
      }
    }

    const now = new Date().toISOString();
    const updatedService: ServiceCatalogItem = {
      ...current,
      ...updates,
      updated_at: now,
      published_at: updates.status === 'published' && !current.published_at ? now : current.published_at
    };

    this.catalog[index] = updatedService;
    this.persist();
    return updatedService;
  }

  public async updateServiceStatus(
    id: string, 
    status: RecordStatus
  ): Promise<ServiceCatalogItem> {
    await this.requireCatalogAdmin();
    const token = await this.getAccessToken();
    if (token) {
      await this.fetchImpl(`/api/admin/services/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
    }
    return this.updateService(id, { status });
  }

  public async deleteService(id: string, softArchive = true): Promise<boolean> {
    const session = await this.requireCatalogAdmin();
    if (!softArchive && session.role !== 'superadmin') {
      throw new Error('Permission denied: Only superadmin can permanently delete services.');
    }
    const index = this.catalog.findIndex(s => s.id === id);
    if (index === -1) return false;

    if (softArchive) {
      this.catalog[index].status = 'archived';
      this.catalog[index].updated_at = new Date().toISOString();
    } else {
      this.catalog.splice(index, 1);
    }

    this.persist();
    return true;
  }

  public async updateDivision(
    id: string,
    updates: Partial<ServiceDivision>
  ): Promise<ServiceDivision> {
    await this.requireCatalogAdmin();
    const index = this.divisions.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Division with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    this.divisions[index] = {
      ...this.divisions[index],
      ...updates,
      updated_at: now
    };

    this.persist();
    return this.divisions[index];
  }

  public async reorderServices(divisionId: string, orderedServiceIds: string[]): Promise<void> {
    await this.requireCatalogAdmin();
    orderedServiceIds.forEach((id, orderIndex) => {
      const item = this.catalog.find(s => s.id === id && s.division_id === divisionId);
      if (item) {
        item.display_order = orderIndex + 1;
        item.updated_at = new Date().toISOString();
      }
    });
    this.persist();
  }

  public async reorderDivisions(orderedDivisionIds: string[]): Promise<void> {
    await this.requireCatalogAdmin();
    orderedDivisionIds.forEach((id, orderIndex) => {
      const div = this.divisions.find(d => d.id === id);
      if (div) {
        div.display_order = orderIndex + 1;
        div.updated_at = new Date().toISOString();
      }
    });
    this.persist();
  }

  public resetToFactorySeed() {
    this.divisions = [...SEED_DIVISIONS];
    this.catalog = [...SEED_SERVICES];
    this.relations = [];
    this.persist();
  }

  // --- Legacy URL Resolver ---
  public resolveLegacyUrl(slug: string): string | null {
    if (!slug) return null;
    const cleaned = slug.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '');
    
    // Direct matches
    if (LEGACY_URL_REDIRECTS[cleaned]) {
      return LEGACY_URL_REDIRECTS[cleaned];
    }
    if (LEGACY_URL_REDIRECTS['/' + cleaned]) {
      return LEGACY_URL_REDIRECTS['/' + cleaned];
    }
    if (LEGACY_URL_REDIRECTS['/services/' + cleaned]) {
      return LEGACY_URL_REDIRECTS['/services/' + cleaned];
    }

    // If slug starts with 'services/'
    if (cleaned.startsWith('services/')) {
      const stripped = cleaned.replace(/^services\//, '');
      if (LEGACY_URL_REDIRECTS[stripped]) {
        return LEGACY_URL_REDIRECTS[stripped];
      }
      if (LEGACY_URL_REDIRECTS['/' + stripped]) {
        return LEGACY_URL_REDIRECTS['/' + stripped];
      }
    }

    return null;
  }
}

export const servicesDb = new ResilientServicesService();
