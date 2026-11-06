import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Menu links use router fragments (#flooring, #contact...). Smooth scrolling
      // comes from CSS scroll-behavior; the fixed header offset from scroll-margin-top.
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      // Clicking the same link twice must scroll again.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
  ],
};
