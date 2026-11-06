import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Lang, LocalizedText } from '../models/content.models';

const STORAGE_KEY = 'montano-lang';

/**
 * Active language (English by default), remembered in localStorage.
 *
 * Two kinds of text follow it:
 * - Interface labels (menu, buttons, aria labels): ngx-translate keys in
 *   src/i18n/{en,es}.json, used with the `translate` pipe.
 * - Content (products, services, FAQ...): { en, es } pairs in src/content,
 *   picked with `t()`.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  readonly lang = signal<Lang>(this.readStoredLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.translate.use(lang);
      this.document.documentElement.lang = lang;
      try {
        this.document.defaultView?.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Storage can be blocked (private mode); the choice just isn't remembered.
      }
    });
  }

  toggle(): void {
    this.lang.update((l) => (l === 'en' ? 'es' : 'en'));
  }

  /** Content text in the active language. */
  t(text: LocalizedText): string {
    return text[this.lang()];
  }

  private readStoredLang(): Lang {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return stored === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  }
}
