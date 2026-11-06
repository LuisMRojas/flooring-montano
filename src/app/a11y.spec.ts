import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { App } from './app';
import { routes } from './app.routes';
import { StaticTranslateLoader } from './core/i18n/static-translate-loader';
import { Home } from './pages/home/home';

/** Accessibility guards (Trello card 21). */
describe('Accessibility', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App, Home],
      providers: [
        provideRouter(routes),
        provideTranslateService({ loader: provideTranslateLoader(StaticTranslateLoader), fallbackLang: 'en', lang: 'en' }),
      ],
    }).compileComponents();
  });

  async function renderApp() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('starts with a skip link to the main content', async () => {
    const { el } = await renderApp();
    const first = el.querySelector('a, button')!;
    expect(first.classList).toContain('skip-link');
    expect(first.getAttribute('href')).toBe('#main');
    expect(el.querySelector('main#main')).toBeTruthy();
  });

  it('names the logo link with its visible text (label in name)', async () => {
    const { el } = await renderApp();
    const brand = el.querySelector('a.brand')!;
    expect(brand.hasAttribute('aria-label')).toBe(false);
    expect(brand.textContent!.replace(/\s+/g, ' ')).toContain('Montano Flooring');
  });

  it('gives each navigation landmark its own name', async () => {
    const { el } = await renderApp();
    const header = el.querySelector('.nav-desktop')!.getAttribute('aria-label');
    const footer = el.querySelector('app-footer nav')!.getAttribute('aria-label');
    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
    expect(footer).not.toBe(header);
  });

  it('keeps focus inside the open mobile menu by making the page inert', async () => {
    const { fixture, el } = await renderApp();
    const menuBtn = el.querySelector<HTMLButtonElement>('.menu-btn')!;
    expect(menuBtn.getAttribute('aria-controls')).toBe('mobile-menu');

    menuBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(menuBtn.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('main')!.hasAttribute('inert')).toBe(true);
    expect(el.querySelector('app-footer')!.hasAttribute('inert')).toBe(true);
    expect(el.querySelector('#mobile-menu')!.hasAttribute('inert')).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('main')!.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(menuBtn);
  });

  describe('page content', () => {
    async function renderHome() {
      const fixture = TestBed.createComponent(Home);
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    it('has exactly one h1 and every section titled with an h2', async () => {
      const el = await renderHome();
      expect(el.querySelectorAll('h1').length).toBe(1);
      for (const s of Array.from(el.querySelectorAll('section[id]:not(#home)'))) {
        const title = el.querySelector(`#${s.getAttribute('aria-labelledby')}`);
        expect(title?.tagName, s.id).toBe('H2');
      }
    });

    it('hides decorative section numbers from screen readers', async () => {
      const el = await renderHome();
      const kickers = Array.from(el.querySelectorAll('.kicker'));
      expect(kickers.length).toBeGreaterThan(0);
      for (const k of kickers) expect(k.getAttribute('aria-hidden')).toBe('true');
    });

    it('gives every content image alt text (decorative ones empty on purpose)', async () => {
      const el = await renderHome();
      for (const img of Array.from(el.querySelectorAll('img'))) {
        expect(img.hasAttribute('alt'), img.getAttribute('src')!).toBe(true);
        const decorative = img.closest('.others') || img.classList.contains('about__logo');
        if (!decorative) expect(img.getAttribute('alt')!.trim(), img.getAttribute('src')!).not.toBe('');
      }
    });
  });
});
