import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { LEGACY_URL_REDIRECTS } from '../src/data/seedData';
import { UNIKORN_FOUR_PRODUCTS } from '../src/data/productsData';
import {
  CANONICAL_ORIGIN,
  getCanonicalPrerenderPaths,
  injectSsrIntoTemplate
} from '../src/lib/seo';
import { generateSitemapXml } from '../src/lib/sitemap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const ssrEntryPath = path.join(rootDir, 'dist-server', 'entry-server.js');

const UTILITY_PRERENDER_PATHS = [
  '/creators/apply',
  '/creators/success',
  '/admin',
  '/admin/login'
];

function buildCloudflareRedirects(): string {
  const lines: string[] = [
    '# Canonical host enforcement (apex & http -> https://www.unikorn360.com)',
    'https://unikorn360.com/* https://www.unikorn360.com/:splat 301',
    'http://unikorn360.com/* https://www.unikorn360.com/:splat 301',
    'http://www.unikorn360.com/* https://www.unikorn360.com/:splat 301',
    '',
    '# Consolidated Creator Network canonical path',
    '/creator-network /creators 301',
    '/creator-network/* /creators 301',
    '',
    '# Legacy division and service URLs -> 6 canonical /services/* routes'
  ];

  const seenSources = new Set<string>(['/creator-network', '/creator-network/*']);

  for (const [rawSource, rawTarget] of Object.entries(LEGACY_URL_REDIRECTS)) {
    const normalizedSource = rawSource.startsWith('/') ? rawSource : `/${rawSource}`;
    const normalizedTarget = rawTarget.startsWith('/') ? rawTarget : `/${rawTarget}`;

    if (
      normalizedSource === normalizedTarget ||
      seenSources.has(normalizedSource) ||
      normalizedSource.includes(' ')
    ) {
      continue;
    }

    seenSources.add(normalizedSource);
    lines.push(`${normalizedSource} ${normalizedTarget} 301`);
  }

  return `${lines.join('\n')}\n`;
}

function buildCloudflareHeaders(): string {
  return `# Security and caching headers for Cloudflare Pages
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600

/llms.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600

/admin
  X-Robots-Tag: noindex, nofollow

/admin/*
  X-Robots-Tag: noindex, nofollow

/creators/apply
  X-Robots-Tag: noindex, nofollow

/creators/success
  X-Robots-Tag: noindex, nofollow
`;
}

async function runPrerender() {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`Missing built client template at ${indexHtmlPath}. Run vite build first.`);
  }
  if (!fs.existsSync(ssrEntryPath)) {
    throw new Error(`Missing built SSR module at ${ssrEntryPath}. Run vite build --ssr first.`);
  }

  const clientTemplateHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  // Preserve clean unrendered app shell for dynamic Express SSR fallback in production
  fs.writeFileSync(path.join(distDir, 'app-shell.html'), clientTemplateHtml, 'utf-8');

  const ssrModule = await import(pathToFileURL(ssrEntryPath).href);
  if (typeof ssrModule.render !== 'function') {
    throw new Error('SSR bundle does not export a render(url) function.');
  }

  const indexablePaths = getCanonicalPrerenderPaths();
  const allPathsToRender = Array.from(new Set([...indexablePaths, ...UTILITY_PRERENDER_PATHS]));

  let renderedCount = 0;

  // Render non-root routes first, then '/' last (so dist/index.html stays clean until the end)
  const orderedPaths = [
    ...allPathsToRender.filter((p) => p !== '/'),
    '/'
  ];

  for (const routePath of orderedPaths) {
    const { html, statusCode, meta } = ssrModule.render(routePath);
    if (statusCode !== 200) {
      throw new Error(`Unexpected non-200 status (${statusCode}) while prerendering canonical path: ${routePath}`);
    }

    const fullHtml = injectSsrIntoTemplate(clientTemplateHtml, meta, html);
    const outFilePath =
      routePath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, routePath.replace(/^\/+/, ''), 'index.html');

    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
    fs.writeFileSync(outFilePath, fullHtml, 'utf-8');
    renderedCount += 1;
  }

  // Prerender branded HTTP 404 fallback page for Cloudflare Pages (dist/404.html) and Express
  const notFoundResult = ssrModule.render('/__404__');
  const notFoundHtml = injectSsrIntoTemplate(
    clientTemplateHtml,
    notFoundResult.meta,
    notFoundResult.html
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf-8');

  // Generate synchronized canonical sitemap.xml in both public/ and dist/
  const sitemapXml = generateSitemapXml({
    baseUrl: CANONICAL_ORIGIN,
    products: UNIKORN_FOUR_PRODUCTS
  });
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  // Generate Cloudflare Pages _redirects and _headers
  fs.writeFileSync(path.join(distDir, '_redirects'), buildCloudflareRedirects(), 'utf-8');
  fs.writeFileSync(path.join(distDir, '_headers'), buildCloudflareHeaders(), 'utf-8');

  console.log(
    `[Unikorn360 Prerender] Successfully generated ${renderedCount} HTML pages, dist/404.html, sitemap.xml, _redirects, and _headers.`
  );
}

runPrerender().catch((err) => {
  console.error('[Unikorn360 Prerender] Failed:', err);
  process.exit(1);
});
