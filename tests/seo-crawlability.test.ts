process.env.NODE_ENV = 'test';
import assert from 'assert';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { app } from '../server.js';
import { UNIKORN_FOUR_PRODUCTS } from '../src/data/productsData.js';
import { RESOURCE_GUIDES } from '../src/data/resourcesData.js';
import { SEED_DIVISIONS, SEED_SERVICES } from '../src/data/seedData.js';
import { SOLUTIONS_DATA } from '../src/data/solutionsData.js';
import {
  CANONICAL_ORIGIN,
  HOMEPAGE_SEO_DESCRIPTION,
  HOMEPAGE_SEO_TITLE,
  getCanonicalPrerenderPaths,
  resolvePublicRouteMeta
} from '../src/lib/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

interface TestCaseResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestCaseResult[] = [];

function record(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      results.push({ name, passed: true, details: 'OK' });
    } catch (err: any) {
      results.push({
        name,
        passed: false,
        details: err?.message || String(err)
      });
    }
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractTagContent(html: string, regex: RegExp): string {
  const match = html.match(regex);
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

async function rawHttpRequest(
  baseUrl: string,
  reqPath: string,
  headers?: Record<string, string>
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  const url = new URL(reqPath, baseUrl);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runSuite() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server.');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const checks = [
      record('1. /robots.txt serves canonical www sitemap and disallows utility routes', async () => {
        const res = await rawHttpRequest(baseUrl, '/robots.txt');
        assert.strictEqual(res.status, 200);
        assert.ok(String(res.headers['content-type']).includes('text/plain'));
        assert.ok(res.body.includes('Sitemap: https://www.unikorn360.com/sitemap.xml'));
        assert.ok(res.body.includes('Disallow: /admin'));
        assert.ok(res.body.includes('Disallow: /creators/apply'));
        assert.ok(res.body.includes('Disallow: /creators/success'));
        assert.ok(res.body.includes('Disallow: /api/'));
      }),

      record('2. /llms.txt serves accurate UNIKORN360 overview', async () => {
        const res = await rawHttpRequest(baseUrl, '/llms.txt');
        assert.strictEqual(res.status, 200);
        assert.ok(String(res.headers['content-type']).includes('text/plain'));
        assert.ok(res.body.includes('UNIKORN360 Business Intelligence'));
        assert.ok(res.body.includes('https://www.unikorn360.com/services/websites-software'));
        assert.ok(res.body.includes('https://invoicepro360.unikorn360.com/'));
      }),

      record('3. /sitemap.xml includes all 66 canonical indexable URLs and zero legacy/admin URLs', async () => {
        const res = await rawHttpRequest(baseUrl, '/sitemap.xml');
        assert.strictEqual(res.status, 200);
        assert.ok(String(res.headers['content-type']).includes('application/xml'));

        const locs = Array.from(res.body.matchAll(/<loc>(.*?)<\/loc>/g)).map((m) => m[1]);
        const expectedCount =
          1 +
          1 +
          1 +
          UNIKORN_FOUR_PRODUCTS.length +
          1 +
          1 +
          Object.keys(SOLUTIONS_DATA).length +
          1 +
          Object.keys(RESOURCE_GUIDES).length +
          1 +
          1 +
          SEED_DIVISIONS.length +
          SEED_SERVICES.length;
        assert.strictEqual(locs.length, expectedCount, `Expected ${expectedCount} sitemap URLs, got ${locs.length}`);

        for (const loc of locs) {
          assert.ok(loc.startsWith(`${CANONICAL_ORIGIN}`), `Non-canonical loc: ${loc}`);
        }
        assert.ok(!locs.some((l) => l.includes('/creator-network')));
        assert.ok(!locs.some((l) => l.includes('/admin')));
        assert.ok(!locs.some((l) => l.includes('/creators/apply')));
        assert.ok(!res.body.includes('<lastmod>'), 'Sitemap must not contain fabricated static lastmod timestamps');
      }),

      record('4. Legacy slugs & apex host emit HTTP 301 redirects preserving query params with zero loops', async () => {
        const legacyExpectations: Array<[string, string]> = [
          ['/build', '/services/websites-software'],
          ['/secure?utm=audit', '/services/security-maintenance?utm=audit'],
          ['/grow', '/services/business-setup-documentation'],
          ['/influence', '/services/marketing-creator-campaigns'],
          ['/automate', '/services/ai-automation-business-systems'],
          ['/research', '/services/research-business-strategy'],
          ['/setup', '/services/business-setup-documentation'],
          ['/services/build', '/services/websites-software'],
          ['/creator-network?ref=bio', '/creators?ref=bio'],
          ['/services/', '/services']
        ];

        for (const [source, expectedTarget] of legacyExpectations) {
          const res = await rawHttpRequest(baseUrl, source);
          assert.strictEqual(res.status, 301, `Expected 301 for ${source}, got ${res.status}`);
          assert.strictEqual(res.headers.location, expectedTarget, `Unexpected location for ${source}`);
        }

        const apexRes = await rawHttpRequest(baseUrl, '/services?ref=dns', { Host: 'unikorn360.com' });
        assert.strictEqual(apexRes.status, 301);
        assert.strictEqual(apexRes.headers.location, 'https://www.unikorn360.com/services?ref=dns');
      }),

      record('5. Built dist/ contains prerendered HTML for every sitemap URL, plus 404.html, _redirects, _headers, robots.txt, llms.txt, and sitemap.xml', async () => {
        assert.ok(fs.existsSync(distDir), 'dist/ directory must exist (run npm run build first)');
        assert.ok(fs.existsSync(path.join(distDir, 'app-shell.html')));
        assert.ok(fs.existsSync(path.join(distDir, '404.html')));
        assert.ok(fs.existsSync(path.join(distDir, '_redirects')));
        assert.ok(fs.existsSync(path.join(distDir, '_headers')));
        assert.ok(fs.existsSync(path.join(distDir, 'robots.txt')));
        assert.ok(fs.existsSync(path.join(distDir, 'llms.txt')));
        assert.ok(fs.existsSync(path.join(distDir, 'sitemap.xml')));
        assert.ok(fs.existsSync(path.join(publicDir, 'sitemap.xml')));

        const canonicalPaths = getCanonicalPrerenderPaths();
        for (const routePath of canonicalPaths) {
          const htmlFile =
            routePath === '/'
              ? path.join(distDir, 'index.html')
              : path.join(distDir, routePath.replace(/^\/+/, ''), 'index.html');
          assert.ok(fs.existsSync(htmlFile), `Missing prerendered HTML for ${routePath}`);

          const html = fs.readFileSync(htmlFile, 'utf-8');
          const expectedMeta = resolvePublicRouteMeta(routePath);

          const canonicalHref = extractTagContent(html, /<link rel="canonical" href="([^"]+)"/);
          assert.strictEqual(canonicalHref, expectedMeta.canonicalUrl, `Canonical mismatch on ${routePath}`);

          const robotsContent = extractTagContent(html, /<meta name="robots" content="([^"]+)"/);
          assert.ok(robotsContent.includes('index, follow'), `Expected indexable robots on ${routePath}`);

          const h1Matches = html.match(/<h1[\s>]/g) || [];
          assert.strictEqual(h1Matches.length, 1, `Expected single <h1> on ${routePath}, found ${h1Matches.length}`);
          assert.ok(html.includes('<main'), `Expected <main> landmark on ${routePath}`);
          assert.ok(!html.includes('Loading Division...'), `Unexpected loading state on ${routePath}`);
          assert.ok(!html.includes('Loading Service Details...'), `Unexpected loading state on ${routePath}`);
        }
      }),

      record('6. Homepage HTML delivers complete non-JS crawlable content, updated SEO metadata, products, and contact info', () => {
        const homeHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
        const actualTitle = extractTagContent(homeHtml, /<title>([^<]+)<\/title>/);
        const actualDesc = extractTagContent(homeHtml, /<meta name="description" content="([^"]+)"/);

        assert.strictEqual(actualTitle, HOMEPAGE_SEO_TITLE);
        assert.strictEqual(actualDesc, HOMEPAGE_SEO_DESCRIPTION);

        // Essential crawlable content without JS
        assert.ok(homeHtml.includes('UNIKORN'));
        assert.ok(homeHtml.includes('Intelligent Systems for Your Business.'));
        assert.ok(homeHtml.includes('href="/services/websites-software"'));
        assert.ok(homeHtml.includes('href="/services/business-setup-documentation"'));
        assert.ok(homeHtml.includes('href="/solutions"'));
        assert.ok(homeHtml.includes('href="/resources"'));
        assert.ok(homeHtml.includes('href="/creators"'));
        assert.ok(homeHtml.includes('+91 98848 24360'));
        assert.ok(homeHtml.includes('contact.unikorn360@gmail.com'));

        for (const prod of UNIKORN_FOUR_PRODUCTS) {
          assert.ok(homeHtml.includes(`href="${prod.path}"`), `Missing internal product link ${prod.path}`);
          assert.ok(homeHtml.includes(`href="${prod.appUrl}"`), `Missing external app link ${prod.appUrl}`);
        }

        // JSON-LD scripts must parse cleanly and contain zero fabricated ratings/reviews
        const jsonLdScripts = Array.from(
          homeHtml.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)
        );
        assert.strictEqual(jsonLdScripts.length, 2, 'Expected org schema + page schema on homepage');
        for (const m of jsonLdScripts) {
          const parsed = JSON.parse(m[1]);
          assert.ok(parsed);
        }
        assert.ok(!homeHtml.includes('aggregateRating'), 'Must not include fabricated aggregateRating');
      }),

      record('7. 404.html and utility routes enforce noindex, nofollow & SSR returns HTTP 404 for invalid paths', async () => {
        const notFoundHtml = fs.readFileSync(path.join(distDir, '404.html'), 'utf-8');
        assert.ok(notFoundHtml.includes('content="noindex, nofollow"'));
        assert.ok(notFoundHtml.includes('Page Not Found'));

        for (const utilPath of ['/admin', '/admin/login', '/creators/apply', '/creators/success']) {
          const htmlFile = path.join(distDir, utilPath.replace(/^\/+/, ''), 'index.html');
          assert.ok(fs.existsSync(htmlFile), `Missing prerendered utility HTML for ${utilPath}`);
          const html = fs.readFileSync(htmlFile, 'utf-8');
          assert.ok(html.includes('content="noindex, nofollow"'), `Missing noindex on ${utilPath}`);
        }

        const ssrEntry = path.join(rootDir, 'dist-server', 'entry-server.js');
        const ssrModule = await import(pathToFileURL(ssrEntry).href);
        const invalidRoutes = [
          '/does-not-exist',
          '/services/unknown-division',
          '/services/websites-software/unknown-service',
          '/products/unknown-product',
          '/solutions/unknown-solution',
          '/resources/unknown-guide'
        ];

        for (const invalidPath of invalidRoutes) {
          const out = ssrModule.render(invalidPath);
          assert.strictEqual(out.statusCode, 404, `Expected SSR 404 for ${invalidPath}`);
          assert.strictEqual(out.meta.robots, 'noindex, nofollow');
        }
      }),

      record('8. Cloudflare _redirects and _headers include domain canonicalization and all legacy 301s', () => {
        const redirects = fs.readFileSync(path.join(distDir, '_redirects'), 'utf-8');
        assert.ok(redirects.includes('https://unikorn360.com/* https://www.unikorn360.com/:splat 301'));
        assert.ok(redirects.includes('/creator-network /creators 301'));
        assert.ok(redirects.includes('/build /services/websites-software 301'));
        assert.ok(redirects.includes('/research /services/research-business-strategy 301'));
        assert.ok(redirects.includes('/setup /services/business-setup-documentation 301'));
        assert.ok(!redirects.includes('/* /index.html 200'), 'Must not catch-all 200 rewrite unknown routes');

        const headers = fs.readFileSync(path.join(distDir, '_headers'), 'utf-8');
        assert.ok(headers.includes('X-Content-Type-Options: nosniff'));
        assert.ok(headers.includes('/admin'));
        assert.ok(headers.includes('X-Robots-Tag: noindex, nofollow'));
      })
    ];

    for (const check of checks) {
      await check();
    }

    let passedCount = 0;
    console.log('\n=== UNIKORN360 SEO & Crawlability Verification Suite ===');
    for (const res of results) {
      if (res.passed) {
        passedCount += 1;
        console.log(`PASS: ${res.name}`);
      } else {
        console.error(`FAIL: ${res.name} -> ${res.details}`);
      }
    }
    console.log(`\nSummary: ${passedCount}/${results.length} checks passed.`);

    if (passedCount !== results.length) {
      process.exitCode = 1;
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runSuite().catch((err) => {
  console.error('SEO suite fatal error:', err);
  process.exit(1);
});
