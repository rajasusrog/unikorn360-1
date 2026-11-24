import React, { useEffect } from 'react';
import { CANONICAL_ORIGIN, DEFAULT_OG_IMAGE } from '../lib/seo';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  omitCanonical?: boolean;
  robots?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  schema?: Record<string, any> | Array<Record<string, any>>;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'UNIKORN360',
  description = '',
  canonicalPath,
  canonicalUrl: canonicalUrlProp,
  omitCanonical = false,
  robots = DEFAULT_ROBOTS,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  structuredData
}) => {
  useEffect(() => {
    const safeTitle = title || 'UNIKORN360';
    const safeDescription = description || '';
    const baseUrl = CANONICAL_ORIGIN;

    let resolvedCanonicalUrl = `${baseUrl}/`;
    if (typeof canonicalUrlProp === 'string' && canonicalUrlProp.trim().length > 0) {
      const trimmed = canonicalUrlProp.trim();
      resolvedCanonicalUrl = trimmed.startsWith('http')
        ? trimmed
        : `${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
    } else {
      const resolvedPath =
        typeof canonicalPath === 'string' && canonicalPath.trim().length > 0
          ? canonicalPath.trim()
          : typeof window !== 'undefined' && window.location?.pathname
            ? window.location.pathname
            : '/';
      resolvedCanonicalUrl = `${baseUrl}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`;
    }

    const resolvedOgImage =
      typeof ogImage === 'string' && ogImage.trim().length > 0
        ? ogImage.trim().startsWith('http')
          ? ogImage.trim()
          : `${baseUrl}${ogImage.trim().startsWith('/') ? ogImage.trim() : `/${ogImage.trim()}`}`
        : DEFAULT_OG_IMAGE;

    const updateOrCreateMetaByName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateOrCreateMetaByProp = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 1. Update Title
    document.title = safeTitle;

    // 2. Update Meta Description & Robots
    updateOrCreateMetaByName('description', safeDescription);
    updateOrCreateMetaByName('robots', robots || DEFAULT_ROBOTS);

    // 3. Update or Remove Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (omitCanonical) {
      if (canonicalLink) {
        canonicalLink.remove();
      }
      const existingOgUrl = document.querySelector('meta[property="og:url"]');
      if (existingOgUrl) {
        existingOgUrl.remove();
      }
    } else {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', resolvedCanonicalUrl);
      updateOrCreateMetaByProp('og:url', resolvedCanonicalUrl);
    }

    // 4. Update OpenGraph Tags
    updateOrCreateMetaByProp('og:title', safeTitle);
    updateOrCreateMetaByProp('og:description', safeDescription);
    updateOrCreateMetaByProp('og:type', ogType);
    updateOrCreateMetaByProp('og:image', resolvedOgImage);

    // 5. Update Twitter Meta
    updateOrCreateMetaByName('twitter:title', safeTitle);
    updateOrCreateMetaByName('twitter:description', safeDescription);
    updateOrCreateMetaByName('twitter:image', resolvedOgImage);

    // 6. Inject Schema JSON-LD if provided
    const activeSchema = schema || structuredData;
    let scriptTag = document.querySelector('script#page-jsonld-schema') as HTMLScriptElement | null;
    if (activeSchema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'page-jsonld-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(activeSchema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      const existing = document.querySelector('script#page-jsonld-schema');
      if (existing) {
        existing.remove();
      }
    };
  }, [title, description, canonicalPath, canonicalUrlProp, omitCanonical, robots, ogType, ogImage, schema, structuredData]);

  return null;
};
