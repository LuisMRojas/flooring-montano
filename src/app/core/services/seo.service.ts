import { DOCUMENT, Injectable, Injector, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TRANSLATIONS } from '../i18n/static-translate-loader';
import { ContentService } from './content.service';
import { LanguageService } from './language.service';

/**
 * Search and sharing metadata (Trello card 22):
 * - <title>, meta description and Open Graph/Twitter tags in the active language.
 * - LocalBusiness structured data (JSON-LD) built from the content: name, phone,
 *   service area (Dearborn and nearby cities), opening hours, what is offered.
 *   No street address, by decision on card 1.
 * Everything is rendered into the prerendered HTML, so crawlers see it without JS.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly content = inject(ContentService);
  private readonly i18n = inject(LanguageService);
  private readonly injector = inject(Injector);

  /** Call once at startup. */
  init(): void {
    effect(
      () => {
        const lang = this.i18n.lang();
        const seo = TRANSLATIONS[lang]['seo'] as { title: string; description: string; locale: string };
        this.title.setTitle(seo.title);
        this.setMeta('name', 'description', seo.description);
        this.setMeta('property', 'og:title', seo.title);
        this.setMeta('property', 'og:description', seo.description);
        this.setMeta('property', 'og:locale', seo.locale);
        this.setMeta('name', 'twitter:title', seo.title);
        this.setMeta('name', 'twitter:description', seo.description);
        this.setMeta('property', 'og:image', this.abs('images/hero/hero-living-room-1200.webp'));
        const url = this.content.siteUrl();
        if (url) this.setMeta('property', 'og:url', url);
        this.writeJsonLd(this.localBusiness(seo.description));
      },
      { injector: this.injector },
    );
  }

  private setMeta(attr: 'name' | 'property', key: string, value: string): void {
    this.meta.updateTag({ [attr]: key, content: value }, `${attr}="${key}"`);
  }

  /** Absolute URL when the site address is known, else the path as is. */
  private abs(path: string): string {
    const base = this.content.siteUrl();
    return base ? new URL(path, base.endsWith('/') ? base : `${base}/`).href : path;
  }

  localBusiness(description: string): Record<string, unknown> {
    const brand = this.content.brand();
    const c = this.content.contact();
    const lang = this.i18n.lang();
    const url = this.content.siteUrl();
    const hero = this.content.home().hero.image.src;

    return {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: brand.legalName,
      alternateName: brand.name,
      description,
      ...(url ? { url, '@id': `${url.replace(/\/$/, '')}/#business` } : {}),
      logo: this.abs(brand.logo),
      image: this.abs(hero),
      telephone: c.phoneE164,
      priceRange: '$$',
      areaServed: [c.mainCity, ...c.nearbyCities].map((name) => ({
        '@type': 'City',
        name,
        containedInPlace: { '@type': 'State', name: 'Michigan' },
      })),
      address: { '@type': 'PostalAddress', addressLocality: c.mainCity, addressRegion: c.region, addressCountry: 'US' },
      openingHoursSpecification: c.hours
        .filter((h) => h.schema)
        .map((h) => ({ '@type': 'OpeningHoursSpecification', ...h.schema })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: lang === 'es' ? 'Pisos y servicios' : 'Flooring and services',
        itemListElement: [...this.content.products(), ...this.content.services()].map((item) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: item.name[lang] },
        })),
      },
    };
  }

  private writeJsonLd(data: Record<string, unknown>): void {
    let script = this.document.head.querySelector<HTMLScriptElement>('script#ld-business');
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ld-business';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}
