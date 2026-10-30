import { UNIKORN_FOUR_PRODUCTS, UnikornProduct } from '../data/productsData';
import { SEED_DIVISIONS, SEED_SERVICES } from '../data/seedData';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import { RESOURCE_GUIDES } from '../data/resourcesData';
import { ServiceDivision, ServiceCatalogItem } from '../types/database';

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  section?: string;
}

export interface GenerateSitemapOptions {
  baseUrl?: string;
  lastmodDate?: string;
  products?: UnikornProduct[];
  divisions?: ServiceDivision[];
  services?: ServiceCatalogItem[];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDateOnly(isoOrDate?: string, fallback = '2026-10-29'): string {
  if (!isoOrDate) return fallback;
  const match = isoOrDate.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : fallback;
}

/**
 * Builds the canonical list of indexable URL entries for UNIKORN360,
 * automatically including the dynamic paths for the four product introduction
 * pages (/products/invoicepro360, /products/deeds360, /products/property360, /products/advocate360),
 * published divisions, published services, solutions, and resource guides.
 */
export function getSitemapEntries(options: GenerateSitemapOptions = {}): SitemapUrlEntry[] {
  const baseUrl = (options.baseUrl || 'https://www.unikorn360.com').replace(/\/+$/, '');
  const defaultDate = options.lastmodDate || '2026-10-29';
  const products = options.products || UNIKORN_FOUR_PRODUCTS;
  const divisions = (options.divisions || SEED_DIVISIONS)
    .filter((d) => d.status === 'published')
    .sort((a, b) => a.display_order - b.display_order);
  const divisionById = new Map<string, ServiceDivision>(divisions.map((d) => [d.id, d]));

  const services = (options.services || SEED_SERVICES)
    .filter((s) => s.status === 'published' && divisionById.has(s.division_id))
    .sort((a, b) => a.display_order - b.display_order);

  const entries: SitemapUrlEntry[] = [
    // 1. Core Hub Pages
    {
      loc: `${baseUrl}/`,
      lastmod: defaultDate,
      changefreq: 'weekly',
      priority: '1.0',
      section: 'Core Hub Pages'
    },
    {
      loc: `${baseUrl}/services`,
      lastmod: defaultDate,
      changefreq: 'weekly',
      priority: '0.95',
      section: 'Core Hub Pages'
    },
    {
      loc: `${baseUrl}/products`,
      lastmod: defaultDate,
      changefreq: 'weekly',
      priority: '0.9',
      section: 'Core Hub Pages'
    }
  ];

  // 2. Dynamic Product Introduction Pages (automatically generated from UNIKORN_FOUR_PRODUCTS)
  for (const product of products) {
    const cleanPath = product.path.startsWith('/') ? product.path : `/products/${product.slug}`;
    entries.push({
      loc: `${baseUrl}${cleanPath}`,
      lastmod: defaultDate,
      changefreq: 'weekly',
      priority: '0.9',
      section: 'Published Product Introduction Pages'
    });
  }

  // 3. Remaining Core Hub Pages
  entries.push(
    {
      loc: `${baseUrl}/creator-network`,
      lastmod: defaultDate,
      changefreq: 'monthly',
      priority: '0.85',
      section: 'Core Hub Pages'
    },
    {
      loc: `${baseUrl}/solutions`,
      lastmod: defaultDate,
      changefreq: 'monthly',
      priority: '0.9',
      section: 'Core Hub Pages'
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: defaultDate,
      changefreq: 'monthly',
      priority: '0.8',
      section: 'Core Hub Pages'
    },
    {
      loc: `${baseUrl}/resources`,
      lastmod: defaultDate,
      changefreq: 'weekly',
      priority: '0.8',
      section: 'Core Hub Pages'
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: defaultDate,
      changefreq: 'monthly',
      priority: '0.8',
      section: 'Core Hub Pages'
    }
  );

  // 4. Published Division Pages
  for (const division of divisions) {
    entries.push({
      loc: `${baseUrl}/services/${division.slug}`,
      lastmod: toIsoDateOnly(division.updated_at, defaultDate),
      changefreq: 'weekly',
      priority: '0.9',
      section: '6 Canonical Division Pages'
    });
  }

  // 5. Published Service Child Pages
  for (const service of services) {
    const parentDivision = divisionById.get(service.division_id);
    if (!parentDivision) continue;
    entries.push({
      loc: `${baseUrl}/services/${parentDivision.slug}/${service.slug}`,
      lastmod: toIsoDateOnly(service.updated_at, defaultDate),
      changefreq: 'monthly',
      priority: '0.85',
      section: 'Published Service Child Pages'
    });
  }

  // 6. Solution Pages
  for (const solution of Object.values(SOLUTIONS_DATA)) {
    entries.push({
      loc: `${baseUrl}/solutions/${solution.slug}`,
      lastmod: defaultDate,
      changefreq: 'monthly',
      priority: '0.85',
      section: 'Published Solution Pages'
    });
  }

  // 7. Resource Guide Pages
  for (const guide of Object.values(RESOURCE_GUIDES)) {
    entries.push({
      loc: `${baseUrl}/resources/${guide.slug}`,
      lastmod: defaultDate,
      changefreq: 'monthly',
      priority: '0.8',
      section: 'Published Resource Guides'
    });
  }

  // Deduplicate by loc while preserving order
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

/**
 * Generates standard Sitemap 0.9 XML string including all dynamic product introduction pages.
 */
export function generateSitemapXml(options: GenerateSitemapOptions = {}): string {
  const entries = getSitemapEntries(options);
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];

  let lastSection = '';
  for (const entry of entries) {
    if (entry.section && entry.section !== lastSection) {
      lines.push(`  <!-- ${escapeXml(entry.section)} -->`);
      lastSection = entry.section;
    }
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
    lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}
