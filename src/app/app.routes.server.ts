import { RenderMode, ServerRoute } from '@angular/ssr';

// Static site (card 22): the page is prerendered to HTML at build time, so
// search engines and the first paint get the full content without waiting for JS.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  // Internal showcase and unknown paths render in the browser (index.csr.html).
  { path: '**', renderMode: RenderMode.Client },
];
