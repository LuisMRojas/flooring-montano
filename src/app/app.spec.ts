import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { App } from './app';
import { routes } from './app.routes';
import { StaticTranslateLoader } from './core/i18n/static-translate-loader';
import { LanguageService } from './core/services/language.service';

describe('App', () => {
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

  it('renders header, footer and bottom bar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
    expect(el.querySelector('app-bottom-bar')).toBeTruthy();
  });

  it('builds the menu from the section data', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.nav-desktop a'),
    ).map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      '/#flooring',
      '/#services',
      '/#gallery',
      '/#reviews',
      '/#about',
      '/#faq',
      '/#contact',
    ]);
  });

  it('switches the interface to Spanish and remembers it', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    TestBed.inject(LanguageService).toggle();
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.bar__btn--estimate')?.textContent).toContain('Estimado gratis');
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem('montano-lang')).toBe('es');
  });

  it('shows the Dearborn service area without a street address', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('app-footer')!;
    expect(footer.textContent).toContain('Serving Dearborn, MI & nearby areas');
    expect(footer.querySelector('a[href^="tel:+1313555"]')).toBeTruthy();
  });
});
