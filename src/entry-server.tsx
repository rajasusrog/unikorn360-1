import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { parseRouteLocation } from './lib/router';
import { resolvePublicRouteMeta, RouteSeoMetadata } from './lib/seo';

export interface ServerRenderResult {
  html: string;
  statusCode: 200 | 404;
  meta: RouteSeoMetadata;
}

export function render(url: string): ServerRenderResult {
  const parsed = parseRouteLocation(url || '/');
  const meta = resolvePublicRouteMeta(parsed.pathname);
  const html = renderToString(
    <StrictMode>
      <App initialPath={parsed.pathname} initialSearch={parsed.search} />
    </StrictMode>
  );

  return {
    html,
    statusCode: meta.statusCode,
    meta
  };
}
