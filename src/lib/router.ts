export interface ParsedRouteLocation {
  pathname: string;
  search: string;
  fullUrl: string;
}

/**
 * Parses any navigation target or URL path (e.g. "/creators/success?ref=U360-CR-1234")
 * into a normalized pathname (without query string) and search string (with leading "?").
 */
export function parseRouteLocation(rawTarget: string): ParsedRouteLocation {
  const trimmed = (rawTarget || '/').trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  const hashIndex = withLeadingSlash.indexOf('#');
  const withoutHash = hashIndex >= 0 ? withLeadingSlash.slice(0, hashIndex) : withLeadingSlash;

  const queryIndex = withoutHash.indexOf('?');
  const rawPathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const rawSearch = queryIndex >= 0 ? withoutHash.slice(queryIdxSafe(queryIndex, withoutHash)) : '';

  const normalizedPathname =
    rawPathname === '' || rawPathname === '/'
      ? '/'
      : rawPathname.replace(/\/+$/, '') || '/';

  const normalizedSearch = rawSearch === '?' ? '' : rawSearch;

  return {
    pathname: normalizedPathname,
    search: normalizedSearch,
    fullUrl: `${normalizedPathname}${normalizedSearch}`
  };
}

function queryIdxSafe(idx: number, _str: string): number {
  return idx;
}

/**
 * Extracts a query parameter value from a search string (e.g. "?ref=U360-CR-8812").
 */
export function extractQueryParam(search: string, key: string): string | null {
  const normalized = (search || '').startsWith('?') ? search.slice(1) : search || '';
  const params = new URLSearchParams(normalized);
  const val = params.get(key);
  return val && val.trim().length > 0 ? val.trim() : null;
}

/**
 * Extracts the creator application reference number from a router search string
 * (or window.location.search if search is not explicitly supplied).
 */
export function extractCreatorReference(search?: string): string {
  const effectiveSearch =
    typeof search === 'string'
      ? search
      : typeof window !== 'undefined' && window.location
        ? window.location.search
        : '';
  return extractQueryParam(effectiveSearch, 'ref') || 'U360-CR-SUCCESS';
}
