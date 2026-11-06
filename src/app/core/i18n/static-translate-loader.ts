import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import en from '../../../i18n/en.json';
import es from '../../../i18n/es.json';
import { Lang } from '../models/content.models';

export const TRANSLATIONS: Record<Lang, TranslationObject> = { en, es };

/**
 * Interface texts are bundled with the app instead of fetched from /i18n/*.json:
 * both files together are ~2 kB, there is no extra request, no flash of
 * untranslated keys on first paint, and it works the same when prerendered.
 */
@Injectable()
export class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(TRANSLATIONS[lang as Lang] ?? TRANSLATIONS.en);
  }
}
