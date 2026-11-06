import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
import { StaticTranslateLoader } from './core/i18n/static-translate-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Menu links use router fragments (#flooring, #contact...). Smooth scrolling
      // comes from CSS scroll-behavior; the header offset from ViewportScroller.
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      // Clicking the same link twice must scroll again.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
    // Interface texts (Trello card 15). The active language is set by LanguageService.
    provideTranslateService({
      loader: provideTranslateLoader(StaticTranslateLoader),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
