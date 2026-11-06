import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../i18n/static-translate-loader';
import { ContentService, DEFAULT_CONTENT } from './content.service';
import { LanguageService } from './language.service';
import { SeoService } from './seo.service';

describe('SeoService (card 22)', () => {
  let doc: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ loader: provideTranslateLoader(StaticTranslateLoader), fallbackLang: 'en', lang: 'en' })],
    });
    doc = TestBed.inject(DOCUMENT);
    doc.head.querySelector('#ld-business')?.remove();
    TestBed.inject(ContentService).load(structuredClone(DEFAULT_CONTENT));
    TestBed.inject(SeoService).init();
    TestBed.tick();
  });

  const meta = (sel: string) => doc.head.querySelector(sel)?.getAttribute('content');
  const ld = () => JSON.parse(doc.head.querySelector('#ld-business')!.textContent!);

  it('sets a local title and description with the city', () => {
    expect(doc.title).toBe('Flooring in Dearborn, MI | Montano Flooring');
    expect(meta('meta[name="description"]')).toContain('Dearborn, MI');
    expect(meta('meta[property="og:title"]')).toBe(doc.title);
  });

  it('switches title, description and locale to Spanish', () => {
    TestBed.inject(LanguageService).toggle();
    TestBed.tick();
    expect(doc.title).toBe('Pisos en Dearborn, MI | Montano Flooring');
    expect(meta('meta[property="og:locale"]')).toBe('es_US');
  });

  it('describes the business for search engines without a street address', () => {
    const data = ld();
    expect(data['@type']).toBe('HomeAndConstructionBusiness');
    expect(data.name).toBe('Montano Flooring LLC');
    expect(data.telephone).toBe('+13135550142');
    expect(data.areaServed.map((c: { name: string }) => c.name)).toEqual([
      'Dearborn',
      'Dearborn Heights',
      'Allen Park',
      'Detroit',
      'Livonia',
    ]);
    expect(data.address.streetAddress).toBeUndefined();
    expect(data.address.addressLocality).toBe('Dearborn');
    expect(data.openingHoursSpecification.length).toBe(2); // Sunday closed
    expect(data.hasOfferCatalog.itemListElement.length).toBe(8);
  });

  it('uses absolute URLs once the site address is set', () => {
    const data = structuredClone(DEFAULT_CONTENT);
    data.site.url = 'https://montanoflooring.com';
    TestBed.inject(ContentService).load(data);
    TestBed.tick();
    expect(ld().url).toBe('https://montanoflooring.com');
    expect(ld().logo).toBe('https://montanoflooring.com/brand/montano-flooring-logo.png');
    expect(meta('meta[property="og:image"]')).toBe('https://montanoflooring.com/images/hero/hero-living-room-1200.webp');
  });
});
