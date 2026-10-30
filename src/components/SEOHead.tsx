import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  schema?: Record<string, any> | Array<Record<string, any>>;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'UNIKORN360',
  description = '',
  canonicalPath,
  canonicalUrl: canonicalUrlProp,
  schema,
  structuredData
}) => {
  useEffect(() => {
    const safeTitle = title || 'UNIKORN360';
    const safeDescription = description || '';
    const baseUrl = 'https://www.unikorn360.com';

    let resolvedCanonicalUrl = baseUrl;
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

    // 1. Update Title
    document.title = safeTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', safeDescription);

    // 3. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', resolvedCanonicalUrl);

    // 4. Update OpenGraph Tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('og:title', safeTitle);
    updateOrCreateMeta('og:description', safeDescription);
    updateOrCreateMeta('og:url', resolvedCanonicalUrl);

    // 5. Update Twitter Meta
    const updateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateTwitterMeta('twitter:title', safeTitle);
    updateTwitterMeta('twitter:description', safeDescription);

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
  }, [title, description, canonicalPath, canonicalUrlProp, schema, structuredData]);

  return null;
};
