import { UNIKORN_FOUR_PRODUCTS, PRODUCTS_BY_SLUG, PRODUCT_FAQS_BY_SLUG } from '../data/productsData';
import {
  LEGACY_URL_REDIRECTS,
  SEED_DIVISIONS,
  getSeedDivisionBySlug,
  getSeedServiceByDivisionAndSlug
} from '../data/seedData';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import { RESOURCE_GUIDES } from '../data/resourcesData';
import { BUSINESS_INFO } from '../data/servicesData';
import { ServiceCatalogItem, ServiceDivision } from '../types/database';
import { parseRouteLocation } from './router';
import { getSitemapEntries } from './sitemap';

export const CANONICAL_ORIGIN = 'https://www.unikorn360.com';
export const DEFAULT_OG_IMAGE =
  'https://www.unikorn360.com/assets/aistudio/ChatGPT_Image_Oct_30__2026__06_57_30_AM_a8896c5c.png';

export const HOMEPAGE_SEO_TITLE =
  'UNIKORN360 Business Intelligence | Website, E-Commerce, SaaS & AI Solutions';
export const HOMEPAGE_SEO_DESCRIPTION =
  'UNIKORN360 Business Intelligence provides professional website development, e-commerce, custom SaaS, cybersecurity, digital marketing and AI-powered business automation solutions.';

export interface RouteSeoMetadata {
  statusCode: 200 | 404;
  pathname: string;
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  ogType: 'website' | 'article';
  ogImage: string;
  isIndexable: boolean;
  schema: Record<string, any> | Array<Record<string, any>> | null;
}

const DEFAULT_INDEX_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, nofollow';

/**
 * Resolves any legacy slug, legacy division/service path, /creator-network alias,
 * or redundant trailing slash into its canonical relative URL (preserving query string).
 * Returns null if the URL is already canonical or is not a redirect rule.
 */
export function resolveCanonicalRedirect(rawUrl: string): string | null {
  const rawWithoutOrigin = (rawUrl || '/').trim() || '/';
  const queryIdx = rawWithoutOrigin.indexOf('?');
  const rawPathname = queryIdx >= 0 ? rawWithoutOrigin.slice(0, queryIdx) : rawWithoutOrigin;
  const rawSearch = queryIdx >= 0 ? rawWithoutOrigin.slice(queryIdx) : '';

  // Normalize trailing slash (e.g. /services/ -> /services) while preserving root '/'
  const hadTrailingSlash = rawPathname.length > 1 && rawPathname.endsWith('/');
  const parsed = parseRouteLocation(rawWithoutOrigin);
  const cleanLower = parsed.pathname.toLowerCase();

  // Direct legacy / alias mappings (case-insensitive)
  if (cleanLower === '/creator-network') {
    return `/creators${parsed.search}`;
  }

  const withoutLeading = cleanLower.replace(/^\/+/, '');
  let mappedTarget: string | null = null;

  if (LEGACY_URL_REDIRECTS[cleanLower]) {
    mappedTarget = LEGACY_URL_REDIRECTS[cleanLower];
  } else if (LEGACY_URL_REDIRECTS[withoutLeading]) {
    mappedTarget = LEGACY_URL_REDIRECTS[withoutLeading];
  } else if (cleanLower.startsWith('/services/')) {
    const remainder = cleanLower.slice('/services/'.length);
    if (LEGACY_URL_REDIRECTS[`/services/${remainder}`]) {
      mappedTarget = LEGACY_URL_REDIRECTS[`/services/${remainder}`];
    } else if (!remainder.includes('/') && LEGACY_URL_REDIRECTS[remainder]) {
      mappedTarget = LEGACY_URL_REDIRECTS[remainder];
    }
  }

  if (mappedTarget && mappedTarget !== cleanLower) {
    return `${mappedTarget}${parsed.search}`;
  }

  if (hadTrailingSlash && parsed.pathname !== rawPathname) {
    return `${parsed.pathname}${rawSearch === '?' ? '' : rawSearch}`;
  }

  if (rawPathname !== cleanLower && isKnownCaseSensitiveRoute(cleanLower)) {
    return `${cleanLower}${parsed.search}`;
  }

  return null;
}

function isKnownCaseSensitiveRoute(cleanLower: string): boolean {
  if (
    cleanLower === '/' ||
    cleanLower === '/services' ||
    cleanLower === '/products' ||
    cleanLower === '/creators' ||
    cleanLower === '/creators/apply' ||
    cleanLower === '/creators/success' ||
    cleanLower === '/solutions' ||
    cleanLower === '/resources' ||
    cleanLower === '/about' ||
    cleanLower === '/contact' ||
    cleanLower === '/admin' ||
    cleanLower === '/admin/login'
  ) {
    return true;
  }
  if (cleanLower.startsWith('/products/')) {
    const slug = cleanLower.slice('/products/'.length);
    return Boolean(PRODUCTS_BY_SLUG[slug]);
  }
  if (cleanLower.startsWith('/solutions/')) {
    const slug = cleanLower.slice('/solutions/'.length);
    return Boolean(SOLUTIONS_DATA[slug]);
  }
  if (cleanLower.startsWith('/resources/')) {
    const slug = cleanLower.slice('/resources/'.length);
    return Boolean(RESOURCE_GUIDES[slug]);
  }
  if (cleanLower.startsWith('/services/')) {
    const parts = cleanLower.slice('/services/'.length).split('/');
    if (parts.length === 1) return Boolean(getSeedDivisionBySlug(parts[0]));
    if (parts.length === 2) return Boolean(getSeedServiceByDivisionAndSlug(parts[0], parts[1]));
  }
  return false;
}

/**
 * Resolves authoritative route SEO metadata, HTTP status code (200 vs 404),
 * canonical URL, robots directives, and Schema.org JSON-LD for SSR, prerendering, and client navigation.
 */
export function resolvePublicRouteMeta(
  rawPathname: string,
  options?: {
    divisions?: ServiceDivision[];
    services?: ServiceCatalogItem[];
  }
): RouteSeoMetadata {
  const parsed = parseRouteLocation(rawPathname || '/');
  const pathname = parsed.pathname.toLowerCase();

  const makeBreadcrumb = (items: Array<{ name: string; url: string }>) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  });

  // 1. Homepage
  if (pathname === '/') {
    return {
      statusCode: 200,
      pathname: '/',
      title: HOMEPAGE_SEO_TITLE,
      description: HOMEPAGE_SEO_DESCRIPTION,
      canonicalUrl: `${CANONICAL_ORIGIN}/`,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${CANONICAL_ORIGIN}/#webpage`,
        url: `${CANONICAL_ORIGIN}/`,
        name: HOMEPAGE_SEO_TITLE,
        description: HOMEPAGE_SEO_DESCRIPTION,
        isPartOf: { '@id': `${CANONICAL_ORIGIN}/#website` },
        about: { '@id': `${CANONICAL_ORIGIN}/#organization` }
      }
    };
  }

  // 2. Services Directory
  if (pathname === '/services') {
    const divisions = options?.divisions || SEED_DIVISIONS.filter((d) => d.status === 'published');
    return {
      statusCode: 200,
      pathname: '/services',
      title: 'Services Directory | UNIKORN360 Business Intelligence & Systems',
      description:
        "Explore Unikorn360's six specialized divisions: Websites & Software, Security & Maintenance, Marketing & Creator Campaigns, AI Automation, Research & Strategy, and Business Setup.",
      canonicalUrl: `${CANONICAL_ORIGIN}/services`,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${CANONICAL_ORIGIN}/services#webpage`,
            url: `${CANONICAL_ORIGIN}/services`,
            name: 'Services Directory | UNIKORN360 Business Intelligence & Systems',
            description:
              'Six specialized service divisions covering websites, custom software, cybersecurity, marketing, creator campaigns, AI automation, strategy, and business setup.',
            isPartOf: { '@id': `${CANONICAL_ORIGIN}/#website` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: divisions.length,
              itemListElement: divisions.map((div, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: div.name,
                url: `${CANONICAL_ORIGIN}/services/${div.slug}`
              }))
            }
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Services', url: `${CANONICAL_ORIGIN}/services` }
          ])
        ]
      }
    };
  }

  // 3. Division & Child Service Pages (/services/:division and /services/:division/:service)
  if (pathname.startsWith('/services/')) {
    const parts = pathname.slice('/services/'.length).split('/').filter(Boolean);
    if (parts.length === 1) {
      const divSlug = parts[0];
      const liveDivision = options?.divisions?.find(
        (d) => d.slug === divSlug && d.status === 'published'
      );
      const seedRes = getSeedDivisionBySlug(divSlug);
      const division = liveDivision || seedRes?.division;
      if (division) {
        const canonicalUrl = `${CANONICAL_ORIGIN}/services/${division.slug}`;
        return {
          statusCode: 200,
          pathname: `/services/${division.slug}`,
          title: division.seo_title || `${division.name} Services | Unikorn360`,
          description: division.seo_description || division.short_description,
          canonicalUrl,
          robots: DEFAULT_INDEX_ROBOTS,
          ogType: 'website',
          ogImage: DEFAULT_OG_IMAGE,
          isIndexable: true,
          schema: {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'CollectionPage',
                '@id': `${canonicalUrl}#webpage`,
                url: canonicalUrl,
                name: division.name,
                description: division.seo_description || division.short_description,
                isPartOf: { '@id': `${CANONICAL_ORIGIN}/#website` }
              },
              makeBreadcrumb([
                { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
                { name: 'Services', url: `${CANONICAL_ORIGIN}/services` },
                { name: division.name, url: canonicalUrl }
              ])
            ]
          }
        };
      }
    } else if (parts.length === 2) {
      const [divSlug, svcSlug] = parts;
      const liveDiv = options?.divisions?.find(
        (d) => d.slug === divSlug && d.status === 'published'
      );
      const liveSvc =
        liveDiv &&
        options?.services?.find(
          (s) => s.division_id === liveDiv.id && s.slug === svcSlug && s.status === 'published'
        );
      const seedRes = getSeedServiceByDivisionAndSlug(divSlug, svcSlug);
      const division = liveDiv || seedRes?.division;
      const service = liveSvc || seedRes?.service;

      if (division && service) {
        const canonicalUrl = `${CANONICAL_ORIGIN}/services/${division.slug}/${service.slug}`;
        const graph: Array<Record<string, any>> = [
          {
            '@type': 'Service',
            '@id': `${canonicalUrl}#service`,
            name: service.service_name,
            description: service.short_description,
            url: canonicalUrl,
            provider: { '@id': `${CANONICAL_ORIGIN}/#organization` }
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Services', url: `${CANONICAL_ORIGIN}/services` },
            { name: division.name, url: `${CANONICAL_ORIGIN}/services/${division.slug}` },
            { name: service.service_name, url: canonicalUrl }
          ])
        ];
        if (service.faqs && service.faqs.length > 0) {
          graph.push({
            '@type': 'FAQPage',
            mainEntity: service.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          });
        }
        return {
          statusCode: 200,
          pathname: `/services/${division.slug}/${service.slug}`,
          title: service.seo_title || `${service.service_name} | Unikorn360`,
          description: service.seo_description || service.short_description,
          canonicalUrl,
          robots: DEFAULT_INDEX_ROBOTS,
          ogType: 'website',
          ogImage: DEFAULT_OG_IMAGE,
          isIndexable: true,
          schema: {
            '@context': 'https://schema.org',
            '@graph': graph
          }
        };
      }
    }
  }

  // 4. Products Directory & Individual Product Pages
  if (pathname === '/products') {
    const canonicalUrl = `${CANONICAL_ORIGIN}/products`;
    return {
      statusCode: 200,
      pathname: '/products',
      title: 'Software Products — InvoicePro360, Deeds360, Property360 & Advocate360 | UNIKORN360',
      description:
        'Explore UNIKORN360 standalone software applications: InvoicePro360, Deeds360, Property360, and Advocate360. View verified product details or open each web application.',
      canonicalUrl,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${canonicalUrl}#webpage`,
            url: canonicalUrl,
            name: 'UNIKORN360 Software Products',
            isPartOf: { '@id': `${CANONICAL_ORIGIN}/#website` }
          },
          {
            '@type': 'ItemList',
            name: 'UNIKORN360 Software Products',
            url: canonicalUrl,
            numberOfItems: UNIKORN_FOUR_PRODUCTS.length,
            itemListElement: UNIKORN_FOUR_PRODUCTS.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: product.name,
              url: product.canonicalUrl,
              description: product.shortDescription
            }))
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Products', url: canonicalUrl }
          ])
        ]
      }
    };
  }

  if (pathname.startsWith('/products/')) {
    const slug = pathname.slice('/products/'.length);
    const product = PRODUCTS_BY_SLUG[slug];
    if (product) {
      const productFaqs = PRODUCT_FAQS_BY_SLUG[product.slug] || product.faqs;
      const graph: Array<Record<string, any>> = [
        {
          '@type': 'SoftwareApplication',
          '@id': `${product.canonicalUrl}#software`,
          name: product.name,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: product.canonicalUrl,
          sameAs: product.appUrl,
          description: product.fullDescription,
          publisher: { '@id': `${CANONICAL_ORIGIN}/#organization` }
        },
        makeBreadcrumb([
          { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
          { name: 'Products', url: `${CANONICAL_ORIGIN}/products` },
          { name: product.name, url: product.canonicalUrl }
        ])
      ];
      if (productFaqs.length > 0) {
        graph.push({
          '@type': 'FAQPage',
          mainEntity: productFaqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer
            }
          }))
        });
      }
      return {
        statusCode: 200,
        pathname: `/products/${product.slug}`,
        title: product.seoTitle,
        description: product.seoDescription,
        canonicalUrl: product.canonicalUrl,
        robots: DEFAULT_INDEX_ROBOTS,
        ogType: 'website',
        ogImage: DEFAULT_OG_IMAGE,
        isIndexable: true,
        schema: {
          '@context': 'https://schema.org',
          '@graph': graph
        }
      };
    }
  }

  // 5. Creator Network Routes
  if (pathname === '/creators') {
    const canonicalUrl = `${CANONICAL_ORIGIN}/creators`;
    return {
      statusCode: 200,
      pathname: '/creators',
      title: 'Tamil Content Creators Wanted — UNIKORN360 Creator Network',
      description:
        'Get paid to create brand videos. Join the UNIKORN360 Creator Network. Free registration for Tamil UGC, nano, micro, and established digital creators across all districts.',
      canonicalUrl,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${canonicalUrl}#webpage`,
            url: canonicalUrl,
            name: 'UNIKORN360 Creator Network',
            isPartOf: { '@id': `${CANONICAL_ORIGIN}/#website` }
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Creator Network', url: canonicalUrl }
          ])
        ]
      }
    };
  }

  if (pathname === '/creators/apply') {
    return {
      statusCode: 200,
      pathname: '/creators/apply',
      title: 'Creator Registration Form | UNIKORN360 Creator Network',
      description: 'Apply to join the UNIKORN360 Creator Network for paid brand video assignments.',
      canonicalUrl: `${CANONICAL_ORIGIN}/creators/apply`,
      robots: NOINDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: false,
      schema: null
    };
  }

  if (pathname === '/creators/success') {
    return {
      statusCode: 200,
      pathname: '/creators/success',
      title: 'Application Received — UNIKORN360 Creator Network',
      description: 'Your creator network application has been recorded.',
      canonicalUrl: `${CANONICAL_ORIGIN}/creators/success`,
      robots: NOINDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: false,
      schema: null
    };
  }

  // 6. Admin Portal (Utility / Restricted — always noindex)
  if (pathname === '/admin' || pathname === '/admin/login') {
    return {
      statusCode: 200,
      pathname,
      title: pathname === '/admin/login' ? 'Admin Portal Login — UNIKORN360' : 'Admin Services Manager | UNIKORN360',
      description: 'Restricted administrative portal for UNIKORN360 operations.',
      canonicalUrl: `${CANONICAL_ORIGIN}${pathname}`,
      robots: NOINDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: false,
      schema: null
    };
  }

  // 7. Solutions Hub & Child Pages
  if (pathname === '/solutions') {
    const canonicalUrl = `${CANONICAL_ORIGIN}/solutions`;
    return {
      statusCode: 200,
      pathname: '/solutions',
      title: 'Business Solutions | Unikorn360 Business Intelligence',
      description:
        'Comprehensive solutions for enterprises: Start a Business, Run & Stay Compliant, Get Funding, Digitise, Automate, and Expand.',
      canonicalUrl,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${canonicalUrl}#webpage`,
            name: 'Integrated Enterprise Solutions | Unikorn360',
            description:
              'Outcome-oriented business solutions for enterprises: Start, Run, Fund, Digitise, Automate, and Expand.',
            url: canonicalUrl
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Solutions', url: canonicalUrl }
          ])
        ]
      }
    };
  }

  if (pathname.startsWith('/solutions/')) {
    const slug = pathname.slice('/solutions/'.length);
    const solution = SOLUTIONS_DATA[slug];
    if (solution) {
      const canonicalUrl = `${CANONICAL_ORIGIN}/solutions/${solution.slug}`;
      return {
        statusCode: 200,
        pathname: `/solutions/${solution.slug}`,
        title: solution.metaTitle,
        description: solution.metaDescription,
        canonicalUrl,
        robots: DEFAULT_INDEX_ROBOTS,
        ogType: 'website',
        ogImage: DEFAULT_OG_IMAGE,
        isIndexable: true,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${canonicalUrl}#webpage`,
              name: solution.title,
              description: solution.metaDescription,
              url: canonicalUrl,
              publisher: { '@id': `${CANONICAL_ORIGIN}/#organization` }
            },
            makeBreadcrumb([
              { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
              { name: 'Solutions', url: `${CANONICAL_ORIGIN}/solutions` },
              { name: solution.shortTitle, url: canonicalUrl }
            ]),
            {
              '@type': 'FAQPage',
              mainEntity: solution.faqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer }
              }))
            }
          ]
        }
      };
    }
  }

  // 8. Resources Hub & Guides
  if (pathname === '/resources') {
    const canonicalUrl = `${CANONICAL_ORIGIN}/resources`;
    return {
      statusCode: 200,
      pathname: '/resources',
      title: 'MSME Knowledge Base & Regulatory Guides | Unikorn360',
      description:
        'Comprehensive guides for growing businesses on GST compliance, subsidies, DPR preparation for bank loans, factory licences, and business automation.',
      canonicalUrl,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${canonicalUrl}#webpage`,
            name: 'MSME Business Resources & Regulatory Guides | Unikorn360',
            url: canonicalUrl
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Resources', url: canonicalUrl }
          ])
        ]
      }
    };
  }

  if (pathname.startsWith('/resources/')) {
    const slug = pathname.slice('/resources/'.length);
    const guide = RESOURCE_GUIDES[slug];
    if (guide) {
      const canonicalUrl = `${CANONICAL_ORIGIN}/resources/${guide.slug}`;
      return {
        statusCode: 200,
        pathname: `/resources/${guide.slug}`,
        title: guide.metaTitle,
        description: guide.metaDescription,
        canonicalUrl,
        robots: DEFAULT_INDEX_ROBOTS,
        ogType: 'article',
        ogImage: DEFAULT_OG_IMAGE,
        isIndexable: true,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              '@id': `${canonicalUrl}#article`,
              headline: guide.title,
              description: guide.metaDescription,
              author: { '@id': `${CANONICAL_ORIGIN}/#organization` },
              publisher: { '@id': `${CANONICAL_ORIGIN}/#organization` },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonicalUrl
              }
            },
            makeBreadcrumb([
              { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
              { name: 'Resources & Guides', url: `${CANONICAL_ORIGIN}/resources` },
              { name: guide.title, url: canonicalUrl }
            ])
          ]
        }
      };
    }
  }

  // 9. About Us
  if (pathname === '/about') {
    const canonicalUrl = `${CANONICAL_ORIGIN}/about`;
    return {
      statusCode: 200,
      pathname: '/about',
      title: 'About Unikorn360 Business Intelligence | Technology & Systems Partner',
      description:
        'Learn about Unikorn360 Business Intelligence: technology, custom applications, automation, and business intelligence partner founded by S. Rajkumar.',
      canonicalUrl,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            '@id': `${canonicalUrl}#webpage`,
            name: 'About Unikorn360 Business Intelligence',
            description:
              'Learn about Unikorn360 Business Intelligence, founded by S. Rajkumar in Vaniyambadi, Tamil Nadu.',
            url: canonicalUrl,
            mainEntity: { '@id': `${CANONICAL_ORIGIN}/#organization` }
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'About Us', url: canonicalUrl }
          ])
        ]
      }
    };
  }

  // 10. Contact Us
  if (pathname === '/contact') {
    const canonicalUrl = `${CANONICAL_ORIGIN}/contact`;
    return {
      statusCode: 200,
      pathname: '/contact',
      title: 'Contact Unikorn360 | Business Intelligence & Technology Advisory',
      description: `Connect with Unikorn360. Phone/WhatsApp: ${BUSINESS_INFO.phone}. Email: ${BUSINESS_INFO.email}. Online consultations and registered office visits available.`,
      canonicalUrl,
      robots: DEFAULT_INDEX_ROBOTS,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      isIndexable: true,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ContactPage',
            '@id': `${canonicalUrl}#webpage`,
            name: 'Contact Unikorn360 Business Intelligence',
            url: canonicalUrl,
            mainEntity: { '@id': `${CANONICAL_ORIGIN}/#organization` }
          },
          makeBreadcrumb([
            { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
            { name: 'Contact Us', url: canonicalUrl }
          ])
        ]
      }
    };
  }

  // 11. 404 Unknown Route
  return {
    statusCode: 404,
    pathname,
    title: 'Page Not Found | UNIKORN360 Business Intelligence',
    description:
      'The requested page could not be found on UNIKORN360 Business Intelligence. Explore our services, software products, solutions, and resources.',
    canonicalUrl: `${CANONICAL_ORIGIN}${pathname}`,
    robots: NOINDEX_ROBOTS,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    isIndexable: false,
    schema: null
  };
}

/**
 * Returns every canonical indexable route path derived from the sitemap registry.
 */
export function getCanonicalPrerenderPaths(): string[] {
  const entries = getSitemapEntries({ baseUrl: CANONICAL_ORIGIN });
  return entries.map((entry) => {
    const path = entry.loc.slice(CANONICAL_ORIGIN.length) || '/';
    return path.startsWith('/') ? path : `/${path}`;
  });
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJsonForScript(obj: any): string {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

export function buildSsrHeadMarkup(meta: RouteSeoMetadata): string {
  const lines: string[] = [
    `<title>${escapeHtmlAttr(meta.title)}</title>`,
    `    <meta name="description" content="${escapeHtmlAttr(meta.description)}" />`,
    `    <link rel="canonical" href="${escapeHtmlAttr(meta.canonicalUrl)}" />`,
    `    <meta name="robots" content="${escapeHtmlAttr(meta.robots)}" />`,
    `    <meta property="og:title" content="${escapeHtmlAttr(meta.title)}" />`,
    `    <meta property="og:description" content="${escapeHtmlAttr(meta.description)}" />`,
    `    <meta property="og:type" content="${meta.ogType}" />`,
    `    <meta property="og:url" content="${escapeHtmlAttr(meta.canonicalUrl)}" />`,
    `    <meta property="og:site_name" content="Unikorn360 Business Intelligence" />`,
    `    <meta property="og:locale" content="en_IN" />`,
    `    <meta property="og:image" content="${escapeHtmlAttr(meta.ogImage)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtmlAttr(meta.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtmlAttr(meta.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtmlAttr(meta.ogImage)}" />`
  ];

  if (meta.schema) {
    lines.push(
      `    <script id="page-jsonld-schema" type="application/ld+json">${escapeJsonForScript(meta.schema)}</script>`
    );
  }

  return lines.join('\n');
}

/**
 * Injects per-route SEO metadata, JSON-LD, and server-rendered React markup cleanly
 * into the built or source HTML template without duplicating tags.
 */
export function injectSsrIntoTemplate(
  templateHtml: string,
  meta: RouteSeoMetadata,
  appHtml: string
): string {
  const headMarkup = buildSsrHeadMarkup(meta);
  let output = templateHtml.replace(
    /<!--ssr-head-start-->[\s\S]*?<!--ssr-head-end-->/,
    `<!--ssr-head-start-->\n    ${headMarkup}\n    <!--ssr-head-end-->`
  );
  output = output.replace(
    /<div id="root">(?:<!--ssr-outlet-->)?<\/div>/,
    `<div id="root">${appHtml}</div>`
  );
  return output;
}
