import {
  CANONICAL_ORIGIN,
  resolveCanonicalRedirect,
  resolvePublicRouteMeta
} from '../src/lib/seo';

export interface PagesAssetsBinding {
  fetch(input: Request | URL | string, init?: RequestInit): Promise<Response>;
}

export interface PagesEnv {
  ASSETS: PagesAssetsBinding;
}

export interface PagesFunctionContext {
  request: Request;
  env: PagesEnv;
  next: () => Promise<Response>;
}

const STATIC_FILE_EXTENSION_REGEX = /\.[a-z0-9]{1,8}$/i;
const PASS_THROUGH_EXACT_PATHS = new Set(['/robots.txt', '/sitemap.xml', '/llms.txt', '/favicon.ico']);

async function fetchStaticAssetFollowingInternalRedirects(
  assets: PagesAssetsBinding,
  targetUrl: string,
  requestHeaders: Headers
): Promise<Response> {
  let currentUrl = targetUrl;
  for (let hop = 0; hop < 3; hop += 1) {
    const res = await assets.fetch(
      new Request(currentUrl, {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'manual'
      })
    );
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        return res;
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    return res;
  }
  return assets.fetch(new Request(currentUrl, { method: 'GET', headers: requestHeaders }));
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const { request, env, next } = context;
  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  // 1. Enforce apex -> www and http -> https canonical domain 301 redirect
  //    (Never redirect *.pages.dev preview deployments or localhost)
  if (host === 'unikorn360.com' || (host === 'www.unikorn360.com' && url.protocol === 'http:')) {
    const redirectPath = resolveCanonicalRedirect(`${url.pathname}${url.search}`) || `${url.pathname}${url.search}`;
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${CANONICAL_ORIGIN}${redirectPath}`,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // Only perform HTML route/redirect logic on GET/HEAD; forward other methods directly
  if (method !== 'GET' && method !== 'HEAD') {
    return next();
  }

  const pathname = url.pathname || '/';

  // 2. Pass through crawler manifests, static assets, and explicit file extensions (except .html)
  if (
    PASS_THROUGH_EXACT_PATHS.has(pathname) ||
    pathname.startsWith('/assets/') ||
    (STATIC_FILE_EXTENSION_REGEX.test(pathname) && !pathname.toLowerCase().endsWith('.html'))
  ) {
    return next();
  }

  // 3. Enforce canonical 301 redirects for legacy slugs, /creator-network, case variants, and trailing slashes
  const canonicalRedirectTarget = resolveCanonicalRedirect(`${pathname}${url.search}`);
  if (canonicalRedirectTarget) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: new URL(canonicalRedirectTarget, url.origin).toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // 4. Resolve authoritative route metadata and serve clean HTTP 200 (zero 308 trailing-slash bounces) or HTTP 404
  const routeMeta = resolvePublicRouteMeta(pathname);

  if (routeMeta.statusCode === 200) {
    const assetPath = routeMeta.pathname === '/' ? '/' : `${routeMeta.pathname}/`;
    const assetRes = await fetchStaticAssetFollowingInternalRedirects(
      env.ASSETS,
      new URL(assetPath, url.origin).toString(),
      request.headers
    );

    if (assetRes.ok) {
      const headers = new Headers(assetRes.headers);
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      if (!routeMeta.isIndexable) {
        headers.set('X-Robots-Tag', 'noindex, nofollow');
      }
      return new Response(method === 'HEAD' ? null : assetRes.body, {
        status: 200,
        headers
      });
    }
  }

  // 5. Genuine HTTP 404 for unknown routes / invalid slugs
  const notFoundRes = await fetchStaticAssetFollowingInternalRedirects(
    env.ASSETS,
    new URL('/404', url.origin).toString(),
    request.headers
  );

  const notFoundHeaders = new Headers(notFoundRes.ok ? notFoundRes.headers : undefined);
  notFoundHeaders.set('Content-Type', 'text/html; charset=utf-8');
  notFoundHeaders.set('X-Robots-Tag', 'noindex, nofollow');
  notFoundHeaders.set('Cache-Control', 'no-store');

  if (notFoundRes.ok) {
    return new Response(method === 'HEAD' ? null : notFoundRes.body, {
      status: 404,
      headers: notFoundHeaders
    });
  }

  return new Response(method === 'HEAD' ? null : '404 Not Found', {
    status: 404,
    headers: notFoundHeaders
  });
}
