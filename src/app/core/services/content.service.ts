import { Injectable, computed, signal } from '@angular/core';
import faqsJson from '../../../content/faqs.json';
import galleryJson from '../../../content/gallery.json';
import homeJson from '../../../content/home.json';
import productsJson from '../../../content/products.json';
import servicesJson from '../../../content/services.json';
import siteJson from '../../../content/site.json';
import testimonialsJson from '../../../content/testimonials.json';
import {
  Faq,
  GalleryImage,
  HomeContent,
  Orderable,
  Product,
  QuoteOption,
  Section,
  SectionId,
  Service,
  SiteContent,
  Testimonial,
} from '../models/content.models';

/** All site content, as read from src/content/*.json. */
export interface ContentData {
  site: SiteContent;
  home: HomeContent;
  products: Product[];
  services: Service[];
  faqs: Faq[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
}

export const DEFAULT_CONTENT: ContentData = {
  site: siteJson as SiteContent,
  home: homeJson as HomeContent,
  products: productsJson as Product[],
  services: servicesJson as Service[],
  faqs: faqsJson as Faq[],
  testimonials: testimonialsJson as Testimonial[],
  gallery: galleryJson as GalleryImage[],
};

/** Visible records only, in their `order`. */
function published<T extends Orderable>(items: readonly T[]): T[] {
  return items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
}

/**
 * Single source of content for the page. Components never import the JSON
 * directly: menus, sections, cards and form options all come from here, so
 * adding, hiding or reordering a record is a change to the JSON file only.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly data = signal<ContentData>(DEFAULT_CONTENT);

  readonly siteUrl = computed(() => this.data().site.url);
  readonly integrations = computed(() => this.data().site.integrations);
  readonly brand = computed(() => this.data().site.brand);
  readonly contact = computed(() => this.data().site.contact);
  readonly legal = computed(() => this.data().site.legal);
  readonly home = computed(() => this.data().home);

  readonly products = computed(() => published(this.data().products));
  readonly services = computed(() => published(this.data().services));
  readonly faqs = computed(() => published(this.data().faqs));
  readonly testimonials = computed(() => published(this.data().testimonials));
  readonly gallery = computed(() => published(this.data().gallery));

  /** Sections to render: visible, and with content if they need a list. */
  readonly sections = computed<Section[]>(() =>
    published(this.data().site.sections).filter((s) => !s.requires || this[s.requires]().length > 0),
  );

  /** Header and footer menu items. */
  readonly navItems = computed(() => this.sections().filter((s) => s.inNav));

  /** Choices for the quote form's "flooring type" field: products, then services. */
  readonly quoteOptions = computed<QuoteOption[]>(() => [
    ...this.products().map((p) => ({ id: p.id, kind: 'product' as const, label: p.name })),
    ...this.services().map((s) => ({ id: s.id, kind: 'service' as const, label: s.name })),
  ]);

  product(id: string): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  service(id: string): Service | undefined {
    return this.services().find((s) => s.id === id);
  }

  section(id: SectionId): Section | undefined {
    return this.sections().find((s) => s.id === id);
  }

  /** Name of what a testimonial is about (product or service). */
  subjectName(t: Testimonial) {
    const item = t.subject.kind === 'product' ? this.product(t.subject.id) : this.service(t.subject.id);
    return item?.name;
  }

  /** Swap the content (tests, or a future CMS). */
  load(data: ContentData): void {
    this.data.set(data);
  }
}
