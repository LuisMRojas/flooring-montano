import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { LanguageService } from '../services/language.service';
import { StaticTranslateLoader, TRANSLATIONS } from './static-translate-loader';

/** "a.b.c" → "text" for every leaf of a translation file. */
function flatten(obj: object, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
    else out[key] = String(v);
  }
  return out;
}

const en = flatten(TRANSLATIONS.en);
const es = flatten(TRANSLATIONS.es);

describe('Interface translations', () => {
  it('has the same keys in English and Spanish, none empty', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    const empty = Object.entries({ ...en, ...es }).filter(([, v]) => !v.trim());
    expect(empty).toEqual([]);
  });

  describe('rendered app', () => {
    beforeEach(async () => {
      localStorage.clear();
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          provideRouter(routes),
          provideTranslateService({ loader: provideTranslateLoader(StaticTranslateLoader), fallbackLang: 'en', lang: 'en' }),
        ],
      }).compileComponents();
    });

    /** Visible text plus aria-labels, the things a user or screen reader gets. */
    function readable(el: HTMLElement): string {
      const labels = Array.from(el.querySelectorAll('[aria-label]')).map((n) => n.getAttribute('aria-label'));
      return `${el.textContent} ${labels.join(' ')}`;
    }

    it('shows no English interface text once switched to Spanish', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      TestBed.inject(LanguageService).toggle();
      fixture.detectChanges();
      await fixture.whenStable();

      const text = readable(fixture.nativeElement as HTMLElement);
      // Labels that are the same in both languages ("Menu" ≠ "Menú", but e.g. the copyright pattern is shared) are skipped.
      const leftovers = Object.entries(en)
        .filter(([key, value]) => value !== es[key] && !value.includes('{{'))
        .filter(([key, value]) => key !== 'language.switchTo' && text.includes(value))
        .map(([key]) => key);
      expect(leftovers).toEqual([]);
      expect(text).toContain('English'); // the switch offers the other language
    });

    it('fills the copyright with the year and legal name', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const footer = (fixture.nativeElement as HTMLElement).querySelector('.footer__bottom')!;
      expect(footer.textContent).toContain(`© ${new Date().getFullYear()} Montano Flooring LLC`);
    });
  });
});
