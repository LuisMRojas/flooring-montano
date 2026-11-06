import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../core/i18n/static-translate-loader';
import { ContentService, DEFAULT_CONTENT } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { Home } from './home';

describe('Home page (card 17)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideTranslateService({ loader: provideTranslateLoader(StaticTranslateLoader), fallbackLang: 'en', lang: 'en' }),
      ],
    }).compileComponents();
    TestBed.inject(ContentService).load(structuredClone(DEFAULT_CONTENT));
    TestBed.inject(LanguageService);
  });

  async function render() {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  /** Section that contains a given element. */
  const sectionOf = (el: Element) => el.closest('section')?.id;

  it('renders the 9 sections with their anchor ids, in order', async () => {
    const el = await render();
    const ids = Array.from(el.querySelectorAll('section[id]')).map((s) => s.id);
    expect(ids).toEqual(['home', 'flooring', 'services', 'why-us', 'gallery', 'reviews', 'about', 'faq', 'contact']);
  });

  it('labels every section with its heading', async () => {
    const el = await render();
    for (const section of Array.from(el.querySelectorAll('section[id]'))) {
      const labelledBy = section.getAttribute('aria-labelledby');
      expect(labelledBy, section.id).toBeTruthy();
      expect(el.querySelector(`#${labelledBy}`)?.textContent?.trim(), section.id).toBeTruthy();
    }
  });

  it('has quote buttons to #contact in the hero, mid-page and at the close', async () => {
    const el = await render();
    const sections = Array.from(el.querySelectorAll('a[href="/#contact"]')).map(sectionOf);
    expect(sections).toContain('home');
    expect(sections).toContain('why-us'); // financing strip, mid-page
    expect(sections).toContain('flooring'); // shop at home strip + product cards
    expect(sections).toContain('faq'); // closing CTA
  });

  it('shows all the content from the data files', async () => {
    const el = await render();
    expect(el.querySelectorAll('#flooring app-product-card').length).toBe(5);
    expect(el.querySelectorAll('#services app-service-card').length).toBe(3);
    expect(el.querySelectorAll('#why-us .points li').length).toBe(4);
    expect(el.querySelectorAll('#why-us .stats dd').length).toBe(3);
    expect(el.querySelectorAll('#gallery .slide').length).toBe(8);
    expect(el.querySelectorAll('#reviews app-testimonial-card').length).toBe(3);
    expect(el.querySelectorAll('#faq app-faq-accordion button').length).toBe(8);
    expect(el.querySelector('#contact a[href^="tel:"]')).toBeTruthy();
  });

  it('marks sample content as such (card 11)', async () => {
    const text = (await render()).textContent!;
    expect(text).toContain('Sample reviews for demonstration');
    expect(text).toContain('Sample figures for demonstration');
    expect(text).toContain('Sample project photos');
  });

  it('drops a section from the page when its content is emptied', async () => {
    const data = structuredClone(DEFAULT_CONTENT);
    data.testimonials = [];
    TestBed.inject(ContentService).load(data);
    const el = await render();
    expect(el.querySelector('#reviews')).toBeNull();
    // Kickers stay consecutive: About becomes 06
    expect(el.querySelector('#about app-section-header')?.textContent).toContain('06');
  });
});
