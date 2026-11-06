import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { Lang, LocalizedText } from '../models/site.models';

const STORAGE_KEY = 'montano-lang';

/**
 * Active language (English by default), remembered in localStorage.
 * Card 15 plugs ngx-translate into this same signal for interface texts.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  readonly lang = signal<Lang>(this.readStoredLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
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

  /** Text in the active language. */
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
