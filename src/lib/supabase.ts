import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ServiceDivision,
  ServiceCatalogItem,
  ServiceRelation,
  RecordStatus
} from '../types/database';
import { LEGACY_URL_REDIRECTS } from '../data/seedData';
import { UNIKORN_FOUR_PRODUCTS } from '../data/productsData';
import { generateSitemapXml, getSitemapEntries, SitemapUrlEntry } from './sitemap';

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

const OBSOLETE_STORAGE_KEYS = [
  'unikorn360_admin_token',
  'unikorn360_admin_pin',
  'unikorn360_admin_session',
  'unikorn360_service_divisions_v4',
  'unikorn360_service_catalog_v4',
  'unikorn360_service_relations_v4'
];

export function purgeObsoleteAuthStorageKeys(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    for (const key of OBSOLETE_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
}

export const SAFE_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && SAFE_UUID_REGEX.test(value.trim());
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

export interface SupabaseDatabaseLikeClient {
  from: (table: string) => any;
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

export interface ServicesServiceOptions {
  authClient?: SupabaseAuthLikeClient | null;
  dbClient?: SupabaseDatabaseLikeClient | null;
  fetchImpl?: typeof fetch;
}

/**
 * Connected Supabase Service Catalogue & Session Layer.
 *
 * - Performs all reads and writes for `service_divisions`, `service_catalog`,
 *   and `service_relations` directly against Supabase (PostgreSQL + RLS).
 * - Uses database UUIDs for record IDs and slugs for URLs.
 * - Never falls back to localStorage or static seed arrays on read or write.
 * - Never resets or reseeds records when record counts change.
 */
export class ResilientServicesService {
  private authClient: SupabaseAuthLikeClient | null;
  private dbClient: SupabaseDatabaseLikeClient | null;
  private fetchImpl: typeof fetch;

  constructor(
    optionsOrClient?: ServicesServiceOptions | SupabaseAuthLikeClient | null,
    customFetch?: typeof fetch
  ) {
    if (
      optionsOrClient &&
      typeof optionsOrClient === 'object' &&
      ('authClient' in optionsOrClient || 'dbClient' in optionsOrClient || 'fetchImpl' in optionsOrClient)
    ) {
      this.authClient =
        optionsOrClient.authClient !== undefined
          ? optionsOrClient.authClient
          : (supabase as unknown as SupabaseAuthLikeClient | null);
      this.dbClient =
        optionsOrClient.dbClient !== undefined
          ? optionsOrClient.dbClient
          : (supabase as unknown as SupabaseDatabaseLikeClient | null);
      this.fetchImpl = optionsOrClient.fetchImpl || ((...args: Parameters<typeof fetch>) => fetch(...args));
    } else {
      const providedClient =
        optionsOrClient !== undefined
          ? (optionsOrClient as SupabaseAuthLikeClient | null)
          : (supabase as unknown as SupabaseAuthLikeClient | null);
      this.authClient = providedClient;
      this.dbClient =
        providedClient && typeof (providedClient as any).from === 'function'
          ? (providedClient as unknown as SupabaseDatabaseLikeClient)
          : (supabase as unknown as SupabaseDatabaseLikeClient | null);
      this.fetchImpl = customFetch || ((...args: Parameters<typeof fetch>) => fetch(...args));
    }
    purgeObsoleteAuthStorageKeys();
  }

  public setDatabaseClient(client: SupabaseDatabaseLikeClient | null): void {
    this.dbClient = client;
  }

  private getRequiredDb(): SupabaseDatabaseLikeClient {
    if (!this.dbClient || typeof this.dbClient.from !== 'function') {
      throw new Error(
        'Supabase database client is not configured. Service catalogue operations require an active database connection.'
      );
    }
    return this.dbClient;
  }

  private async requireCatalogAdmin(): Promise<{
    user: { id: string; email: string };
    role: 'superadmin' | 'admin';
    accessToken: string;
  }> {
    const result = await this.verifyAdminSession();
    if (result.status !== 'authenticated' || !result.session) {
      throw new Error(result.error || 'Authentication required: Please sign in as an administrator.');
    }
    if (result.session.role !== 'superadmin' && result.session.role !== 'admin') {
      throw new Error('Permission denied: Only superadmin and admin roles can manage the service catalogue.');
    }
    return {
      user: result.session.user,
      role: result.session.role,
      accessToken: result.session.accessToken
    };
  }

  // --- SDK-Managed Auth & Backend Membership Verification ---

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

      await this.authClient.auth.signOut({ scope: 'local' }).catch(() => {});
      return verification;
    } catch (err: any) {
      return {
        status: 'error',
        error: err?.message || 'Network error while attempting administrator sign-in.'
      };
    }
  }

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

  // ====================================================================
  // REAL SUPABASE CATALOGUE OPERATIONS (DIVISIONS, SERVICES, RELATIONS)
  // ====================================================================

  // --- Divisions ---
  public async getDivisions(options?: { includeDrafts?: boolean }): Promise<ServiceDivision[]> {
    const includeDrafts = options?.includeDrafts ?? false;
    if (includeDrafts) {
      await this.requireCatalogAdmin();
    }

    const db = this.getRequiredDb();
    let divQuery = db
      .from('service_divisions')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeDrafts) {
      divQuery = divQuery.eq('status', 'published');
    }

    const { data: divisions, error: divError } = await divQuery;
    if (divError) {
      throw new Error(`Failed to fetch service divisions from Supabase: ${divError.message}`);
    }

    const { data: publishedServices, error: svcError } = await db
      .from('service_catalog')
      .select('id, division_id, status')
      .eq('status', 'published');

    if (svcError) {
      throw new Error(`Failed to fetch published services count from Supabase: ${svcError.message}`);
    }

    const countByDivision = new Map<string, number>();
    for (const svc of publishedServices || []) {
      if (svc.status === 'published' && svc.division_id) {
        countByDivision.set(svc.division_id, (countByDivision.get(svc.division_id) || 0) + 1);
      }
    }

    return ((divisions || []) as ServiceDivision[])
      .filter((div) => includeDrafts || div.status === 'published')
      .sort((a, b) => a.display_order - b.display_order)
      .map((div) => ({
        ...div,
        published_service_count: countByDivision.get(div.id) || 0
      }));
  }

  public async getDivisionBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
  ): Promise<{ division: ServiceDivision; services: ServiceCatalogItem[] } | null> {
    if (!slug) return null;
    const normalizedSlug = slug.toLowerCase().trim();
    const includeDrafts = options?.includeDrafts ?? false;
    if (includeDrafts) {
      await this.requireCatalogAdmin();
    }

    const db = this.getRequiredDb();
    let divQuery = db
      .from('service_divisions')
      .select('*')
      .eq('slug', normalizedSlug);

    if (!includeDrafts) {
      divQuery = divQuery.eq('status', 'published');
    }

    const { data: division, error: divError } = await divQuery.maybeSingle();
    if (divError) {
      throw new Error(`Failed to fetch division "${normalizedSlug}" from Supabase: ${divError.message}`);
    }
    if (!division) {
      return null;
    }
    if (!includeDrafts && division.status !== 'published') {
      return null;
    }

    let svcQuery = db
      .from('service_catalog')
      .select('*')
      .eq('division_id', division.id)
      .order('display_order', { ascending: true });

    if (!includeDrafts) {
      svcQuery = svcQuery.eq('status', 'published');
    }

    const { data: services, error: svcError } = await svcQuery;
    if (svcError) {
      throw new Error(`Failed to fetch services for division "${normalizedSlug}": ${svcError.message}`);
    }

    const filteredServices = ((services || []) as ServiceCatalogItem[])
      .filter((s) => includeDrafts || s.status === 'published')
      .sort((a, b) => a.display_order - b.display_order);

    const publishedCount = filteredServices.filter((s) => s.status === 'published').length;

    return {
      division: {
        ...(division as ServiceDivision),
        published_service_count: publishedCount
      },
      services: filteredServices
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
    if (!divisionSlug || !serviceSlug) return null;
    const includeDrafts = options?.includeDrafts ?? false;
    if (includeDrafts) {
      await this.requireCatalogAdmin();
    }

    const divResult = await this.getDivisionBySlug(divisionSlug, options);
    if (!divResult) return null;

    const { division, services: divisionServices } = divResult;
    const normalizedServiceSlug = serviceSlug.toLowerCase().trim();

    const db = this.getRequiredDb();
    let svcQuery = db
      .from('service_catalog')
      .select('*')
      .eq('division_id', division.id)
      .eq('slug', normalizedServiceSlug);

    if (!includeDrafts) {
      svcQuery = svcQuery.eq('status', 'published');
    }

    const { data: service, error: svcError } = await svcQuery.maybeSingle();
    if (svcError) {
      throw new Error(`Failed to fetch service "${normalizedServiceSlug}" from Supabase: ${svcError.message}`);
    }

    if (!service) return null;
    if (!includeDrafts && service.status !== 'published') {
      return null;
    }

    // Fetch explicit service_relations from Supabase
    const relatedServices: ServiceCatalogItem[] = [];
    const { data: relations, error: relError } = await db
      .from('service_relations')
      .select('*')
      .eq('service_id', service.id)
      .order('display_order', { ascending: true });

    if (!relError && Array.isArray(relations) && relations.length > 0) {
      const relatedIds = relations.map((r: ServiceRelation) => r.related_service_id).filter(Boolean);
      if (relatedIds.length > 0) {
        const { data: relSrvRows } = await db
          .from('service_catalog')
          .select('*')
          .in('id', relatedIds)
          .eq('status', 'published');

        if (Array.isArray(relSrvRows) && relSrvRows.length > 0) {
          const { data: pubDivs } = await db
            .from('service_divisions')
            .select('id')
            .eq('status', 'published');
          const pubDivSet = new Set((pubDivs || []).map((d: any) => d.id));
          const byId = new Map<string, ServiceCatalogItem>(
            (relSrvRows as ServiceCatalogItem[])
              .filter((s) => s.status === 'published' && pubDivSet.has(s.division_id))
              .map((s) => [s.id, s])
          );
          for (const relId of relatedIds) {
            const match = byId.get(relId);
            if (match && match.id !== service.id) {
              relatedServices.push(match);
            }
          }
        }
      }
    }

    // Supplement with other published services in the same published division up to 3
    if (division.status === 'published' && relatedServices.length < 3) {
      for (const sibling of divisionServices) {
        if (
          sibling.id !== service.id &&
          sibling.status === 'published' &&
          !relatedServices.some((r) => r.id === sibling.id)
        ) {
          relatedServices.push(sibling);
          if (relatedServices.length >= 3) break;
        }
      }
    }

    return {
      service: service as ServiceCatalogItem,
      division,
      relatedServices
    };
  }

  public async getAllPublishedServices(): Promise<ServiceCatalogItem[]> {
    const db = this.getRequiredDb();

    const [divRes, svcRes] = await Promise.all([
      db.from('service_divisions').select('id, status').eq('status', 'published'),
      db
        .from('service_catalog')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true })
    ]);

    if (divRes.error) {
      throw new Error(`Failed to fetch published divisions from Supabase: ${divRes.error.message}`);
    }
    if (svcRes.error) {
      throw new Error(`Failed to fetch published services from Supabase: ${svcRes.error.message}`);
    }

    const publishedDivisionIds = new Set(
      (divRes.data || [])
        .filter((d: any) => d.status === 'published')
        .map((d: any) => d.id)
    );

    return ((svcRes.data || []) as ServiceCatalogItem[])
      .filter((s) => s.status === 'published' && publishedDivisionIds.has(s.division_id))
      .sort((a, b) => a.display_order - b.display_order);
  }

  public async getAllServicesForAdmin(): Promise<{
    services: (ServiceCatalogItem & { division_name: string; division_slug: string })[];
    divisions: ServiceDivision[];
    relations: ServiceRelation[];
    stats: {
      totalServices: number;
      publishedServices: number;
      draftServices: number;
      archivedServices: number;
    };
  }> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    const [divRes, svcRes, relRes] = await Promise.all([
      db.from('service_divisions').select('*').order('display_order', { ascending: true }),
      db.from('service_catalog').select('*').order('display_order', { ascending: true }),
      db.from('service_relations').select('*').order('display_order', { ascending: true })
    ]);

    if (divRes.error) {
      throw new Error(`Failed to fetch divisions for admin: ${divRes.error.message}`);
    }
    if (svcRes.error) {
      throw new Error(`Failed to fetch services for admin: ${svcRes.error.message}`);
    }
    if (relRes.error) {
      throw new Error(`Failed to fetch service relations for admin: ${relRes.error.message}`);
    }

    const rawDivisions = ((divRes.data || []) as ServiceDivision[]).sort(
      (a, b) => a.display_order - b.display_order
    );
    const rawServices = ((svcRes.data || []) as ServiceCatalogItem[]).sort(
      (a, b) => a.display_order - b.display_order
    );
    const relations = (relRes.data || []) as ServiceRelation[];

    const divisionMap = new Map(rawDivisions.map((d) => [d.id, d]));
    const publishedCountByDiv = new Map<string, number>();

    for (const s of rawServices) {
      if (s.status === 'published') {
        publishedCountByDiv.set(s.division_id, (publishedCountByDiv.get(s.division_id) || 0) + 1);
      }
    }

    const divisions = rawDivisions.map((d) => ({
      ...d,
      published_service_count: publishedCountByDiv.get(d.id) || 0
    }));

    const enrichedServices = rawServices.map((s) => {
      const parent = divisionMap.get(s.division_id);
      return {
        ...s,
        division_name: parent?.name || 'Unknown Division',
        division_slug: parent?.slug || 'unknown'
      };
    });

    const stats = {
      totalServices: rawServices.length,
      publishedServices: rawServices.filter((s) => s.status === 'published').length,
      draftServices: rawServices.filter((s) => s.status === 'draft').length,
      archivedServices: rawServices.filter((s) => s.status === 'archived').length
    };

    return {
      services: enrichedServices,
      divisions,
      relations,
      stats
    };
  }

  // --- CRUD Operations (Protected for Admin & Superadmin Only via Auth + RLS) ---

  public async createService(
    serviceData: Omit<ServiceCatalogItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<ServiceCatalogItem> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    if (!serviceData.division_id || !isValidUuid(serviceData.division_id)) {
      throw new Error('A valid division UUID (division_id) is required to create a service.');
    }
    const cleanName = (serviceData.service_name || '').trim();
    const cleanSlug = (serviceData.slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanName || !cleanSlug) {
      throw new Error('Service name and URL slug are required.');
    }

    const status: RecordStatus = serviceData.status || 'draft';
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new Error(`Invalid service status "${status}".`);
    }

    const now = new Date().toISOString();
    const insertPayload: Record<string, any> = {
      division_id: serviceData.division_id,
      service_name: cleanName,
      slug: cleanSlug,
      short_description: serviceData.short_description || '',
      full_description: serviceData.full_description || '',
      problems_solved: Array.isArray(serviceData.problems_solved) ? serviceData.problems_solved : [],
      target_customers: Array.isArray(serviceData.target_customers) ? serviceData.target_customers : [],
      benefits: Array.isArray(serviceData.benefits) ? serviceData.benefits : [],
      deliverables: Array.isArray(serviceData.deliverables) ? serviceData.deliverables : [],
      packages: Array.isArray(serviceData.packages) ? serviceData.packages : [],
      process_steps: Array.isArray(serviceData.process_steps) ? serviceData.process_steps : [],
      client_responsibilities: Array.isArray(serviceData.client_responsibilities)
        ? serviceData.client_responsibilities
        : [],
      exclusions: Array.isArray(serviceData.exclusions) ? serviceData.exclusions : [],
      additional_charges: Array.isArray(serviceData.additional_charges)
        ? serviceData.additional_charges
        : [],
      hero_image_url: serviceData.hero_image_url || null,
      hero_image_alt: serviceData.hero_image_alt || null,
      gallery: Array.isArray(serviceData.gallery) ? serviceData.gallery : [],
      faqs: Array.isArray(serviceData.faqs) ? serviceData.faqs : [],
      seo_title: serviceData.seo_title || `${cleanName} | Unikorn360`,
      seo_description: serviceData.seo_description || serviceData.short_description || '',
      social_image_url: serviceData.social_image_url || null,
      status,
      display_order: typeof serviceData.display_order === 'number' ? serviceData.display_order : 0,
      published_at: status === 'published' ? serviceData.published_at || now : null
    };

    if (serviceData.id !== undefined) {
      if (!isValidUuid(serviceData.id)) {
        throw new Error('Service ID must be a valid database UUID.');
      }
      insertPayload.id = serviceData.id;
    }

    const { data, error } = await db
      .from('service_catalog')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create service in Supabase: ${error?.message || 'Unknown database error'}`);
    }

    return data as ServiceCatalogItem;
  }

  public async updateService(
    id: string,
    updates: Partial<ServiceCatalogItem>
  ): Promise<ServiceCatalogItem> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    if (!isValidUuid(id)) {
      throw new Error(`Invalid service UUID "${id}".`);
    }

    const now = new Date().toISOString();
    const allowedColumns: (keyof ServiceCatalogItem)[] = [
      'division_id',
      'service_name',
      'slug',
      'short_description',
      'full_description',
      'problems_solved',
      'target_customers',
      'benefits',
      'deliverables',
      'packages',
      'process_steps',
      'client_responsibilities',
      'exclusions',
      'additional_charges',
      'hero_image_url',
      'hero_image_alt',
      'gallery',
      'faqs',
      'seo_title',
      'seo_description',
      'social_image_url',
      'status',
      'display_order',
      'published_at'
    ];

    const payload: Record<string, any> = {
      updated_at: now
    };

    for (const key of allowedColumns) {
      if (Object.prototype.hasOwnProperty.call(updates, key) && updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    if (payload.slug !== undefined) {
      payload.slug = String(payload.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!payload.slug) {
        throw new Error('Service slug cannot be empty.');
      }
    }

    if (payload.division_id !== undefined && !isValidUuid(payload.division_id)) {
      throw new Error('Parent division_id must be a valid UUID.');
    }

    if (payload.status !== undefined) {
      if (!['draft', 'published', 'archived'].includes(payload.status)) {
        throw new Error(`Invalid service status "${payload.status}".`);
      }
      if (payload.status === 'published' && payload.published_at === undefined) {
        payload.published_at = now;
      } else if (payload.status !== 'published') {
        payload.published_at = null;
      }
    }

    const { data, error } = await db
      .from('service_catalog')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to update service in Supabase: ${error?.message || 'Service not found or access denied'}`);
    }

    return data as ServiceCatalogItem;
  }

  public async updateServiceStatus(
    id: string,
    status: RecordStatus
  ): Promise<ServiceCatalogItem> {
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new Error(`Invalid status "${status}".`);
    }
    return this.updateService(id, {
      status,
      published_at: status === 'published' ? new Date().toISOString() : null
    });
  }

  public async publishService(id: string): Promise<ServiceCatalogItem> {
    return this.updateServiceStatus(id, 'published');
  }

  public async unpublishService(id: string): Promise<ServiceCatalogItem> {
    return this.updateServiceStatus(id, 'draft');
  }

  public async deleteService(id: string, softArchive = true): Promise<boolean> {
    const session = await this.requireCatalogAdmin();
    if (!isValidUuid(id)) {
      throw new Error(`Invalid service UUID "${id}".`);
    }

    if (softArchive) {
      await this.updateServiceStatus(id, 'archived');
      return true;
    }

    if (session.role !== 'superadmin') {
      throw new Error('Permission denied: Only superadmin can permanently delete services.');
    }

    const db = this.getRequiredDb();
    const { data, error } = await db
      .from('service_catalog')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(`Failed to delete service in Supabase: ${error.message}`);
    }
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Service "${id}" could not be deleted or was not found.`);
    }

    return true;
  }

  public async createDivision(
    divisionData: Omit<ServiceDivision, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<ServiceDivision> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    const cleanName = (divisionData.name || '').trim();
    const cleanSlug = (divisionData.slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanName || !cleanSlug) {
      throw new Error('Division name and slug are required.');
    }

    const status: RecordStatus = divisionData.status || 'draft';
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new Error(`Invalid division status "${status}".`);
    }

    const insertPayload: Record<string, any> = {
      name: cleanName,
      slug: cleanSlug,
      short_description: divisionData.short_description || '',
      full_description: divisionData.full_description || '',
      seo_title: divisionData.seo_title || `${cleanName} | Unikorn360`,
      seo_description: divisionData.seo_description || divisionData.short_description || '',
      status,
      display_order: typeof divisionData.display_order === 'number' ? divisionData.display_order : 0
    };

    if (divisionData.id !== undefined) {
      if (!isValidUuid(divisionData.id)) {
        throw new Error('Division ID must be a valid database UUID.');
      }
      insertPayload.id = divisionData.id;
    }

    const { data, error } = await db
      .from('service_divisions')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create division in Supabase: ${error?.message || 'Unknown database error'}`);
    }

    return data as ServiceDivision;
  }

  public async updateDivision(
    id: string,
    updates: Partial<ServiceDivision>
  ): Promise<ServiceDivision> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    if (!isValidUuid(id)) {
      throw new Error(`Invalid division UUID "${id}".`);
    }

    const allowedColumns: (keyof ServiceDivision)[] = [
      'name',
      'slug',
      'short_description',
      'full_description',
      'seo_title',
      'seo_description',
      'status',
      'display_order'
    ];

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    for (const key of allowedColumns) {
      if (Object.prototype.hasOwnProperty.call(updates, key) && updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    if (payload.status !== undefined && !['draft', 'published', 'archived'].includes(payload.status)) {
      throw new Error(`Invalid division status "${payload.status}".`);
    }

    const { data, error } = await db
      .from('service_divisions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to update division in Supabase: ${error?.message || 'Division not found or access denied'}`);
    }

    return data as ServiceDivision;
  }

  public async reorderServices(divisionId: string, orderedServiceIds: string[]): Promise<void> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    if (!isValidUuid(divisionId)) {
      throw new Error(`Invalid division UUID "${divisionId}".`);
    }

    const now = new Date().toISOString();
    for (let idx = 0; idx < orderedServiceIds.length; idx++) {
      const serviceId = orderedServiceIds[idx];
      if (!isValidUuid(serviceId)) {
        throw new Error(`Invalid service UUID "${serviceId}" in reorder list.`);
      }
      const { data, error } = await db
        .from('service_catalog')
        .update({ display_order: idx + 1, updated_at: now })
        .eq('id', serviceId)
        .eq('division_id', divisionId)
        .select('id')
        .single();

      if (error || !data) {
        throw new Error(
          `Failed to reorder service "${serviceId}" in Supabase: ${error?.message || 'Service not found in division'}`
        );
      }
    }
  }

  public async reorderDivisions(orderedDivisionIds: string[]): Promise<void> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    const now = new Date().toISOString();
    for (let idx = 0; idx < orderedDivisionIds.length; idx++) {
      const divId = orderedDivisionIds[idx];
      if (!isValidUuid(divId)) {
        throw new Error(`Invalid division UUID "${divId}" in reorder list.`);
      }
      const { data, error } = await db
        .from('service_divisions')
        .update({ display_order: idx + 1, updated_at: now })
        .eq('id', divId)
        .select('id')
        .single();

      if (error || !data) {
        throw new Error(
          `Failed to reorder division "${divId}" in Supabase: ${error?.message || 'Division not found'}`
        );
      }
    }
  }

  // --- Service Relations ---
  public async getServiceRelations(serviceId: string): Promise<ServiceRelation[]> {
    if (!isValidUuid(serviceId)) {
      throw new Error(`Invalid service UUID "${serviceId}".`);
    }
    const db = this.getRequiredDb();
    const { data, error } = await db
      .from('service_relations')
      .select('*')
      .eq('service_id', serviceId)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch service relations from Supabase: ${error.message}`);
    }
    return (data || []) as ServiceRelation[];
  }

  public async createServiceRelation(
    relation: Omit<ServiceRelation, 'id' | 'created_at'>
  ): Promise<ServiceRelation> {
    await this.requireCatalogAdmin();
    const db = this.getRequiredDb();

    if (!isValidUuid(relation.service_id) || !isValidUuid(relation.related_service_id)) {
      throw new Error('Both service_id and related_service_id must be valid database UUIDs.');
    }
    if (relation.service_id === relation.related_service_id) {
      throw new Error('A service cannot be related to itself.');
    }
    const relationType = relation.relation_type || 'recommended';
    if (!['prerequisite', 'recommended', 'bundle', 'next_step'].includes(relationType)) {
      throw new Error(`Invalid relation_type "${relationType}".`);
    }

    const { data, error } = await db
      .from('service_relations')
      .insert({
        service_id: relation.service_id,
        related_service_id: relation.related_service_id,
        relation_type: relationType,
        display_order: typeof relation.display_order === 'number' ? relation.display_order : 0
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to create service relation in Supabase: ${error?.message || 'Unknown database error'}`
      );
    }

    return data as ServiceRelation;
  }

  public async deleteServiceRelation(relationId: string): Promise<boolean> {
    const session = await this.requireCatalogAdmin();
    if (session.role !== 'superadmin') {
      throw new Error('Permission denied: Only superadmin can delete service relations.');
    }
    if (!isValidUuid(relationId)) {
      throw new Error(`Invalid relation UUID "${relationId}".`);
    }

    const db = this.getRequiredDb();
    const { data, error } = await db
      .from('service_relations')
      .delete()
      .eq('id', relationId)
      .select('id');

    if (error) {
      throw new Error(`Failed to delete service relation in Supabase: ${error.message}`);
    }
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Service relation "${relationId}" not found.`);
    }
    return true;
  }

  // --- Legacy URL Resolver ---
  public resolveLegacyUrl(slug: string): string | null {
    if (!slug) return null;
    const cleaned = slug.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '');

    if (LEGACY_URL_REDIRECTS[cleaned]) {
      return LEGACY_URL_REDIRECTS[cleaned];
    }
    if (LEGACY_URL_REDIRECTS['/' + cleaned]) {
      return LEGACY_URL_REDIRECTS['/' + cleaned];
    }
    if (LEGACY_URL_REDIRECTS['/services/' + cleaned]) {
      return LEGACY_URL_REDIRECTS['/services/' + cleaned];
    }

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

  // --- Dynamic Sitemap Generation ---
  public async getSitemapEntriesAsync(baseUrl = 'https://www.unikorn360.com'): Promise<SitemapUrlEntry[]> {
    const [divisions, services] = await Promise.all([
      this.getDivisions({ includeDrafts: false }),
      this.getAllPublishedServices()
    ]);
    return getSitemapEntries({
      baseUrl,
      products: UNIKORN_FOUR_PRODUCTS,
      divisions,
      services
    });
  }

  public async generateSitemapXmlAsync(baseUrl = 'https://www.unikorn360.com'): Promise<string> {
    const [divisions, services] = await Promise.all([
      this.getDivisions({ includeDrafts: false }),
      this.getAllPublishedServices()
    ]);
    return generateSitemapXml({
      baseUrl,
      products: UNIKORN_FOUR_PRODUCTS,
      divisions,
      services
    });
  }
}

export const servicesDb = new ResilientServicesService();
export { generateSitemapXml, getSitemapEntries };
