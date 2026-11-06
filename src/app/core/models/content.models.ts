// Content model (Trello card 8). Every visible text is an { en, es } pair.
// The data itself lives in src/content/*.json; ContentService reads it.

export type Lang = 'en' | 'es';

export interface LocalizedText {
  en: string;
  es: string;
}

/** Section anchor ids of the single page, in page order. */
export type SectionId =
  | 'home'
  | 'flooring'
  | 'services'
  | 'why-us'
  | 'gallery'
  | 'reviews'
  | 'about'
  | 'faq'
  | 'contact';

/** Common fields for every list record: add, reorder or hide without deleting. */
export interface Orderable {
  id: string;
  order: number;
  /** false = hidden from the page and menus, but kept in the file. */
  visible: boolean;
}

export interface Image {
  src: string;
  alt: LocalizedText;
  width: number;
  height: number;
}

/** A button or link. `target` is the section it scrolls to. */
export interface CallToAction {
  label: LocalizedText;
  target: SectionId;
  /** Product or service id preselected in the quote form (card 19). */
  prefill?: string;
}

// ---------- Site ----------

export interface Section extends Orderable {
  id: SectionId;
  label: LocalizedText;
  /** Shown in the header and footer menus. */
  inNav: boolean;
  /** Section heading shown on the page (the menu uses `label`). */
  title?: LocalizedText;
  /** Short text under the heading. */
  intro?: LocalizedText;
  /** Content list the section needs; if it is empty, the section and its menu item are hidden. */
  requires?: 'products' | 'services' | 'gallery' | 'testimonials' | 'faqs';
}

export interface Brand {
  name: string;
  legalName: string;
  logo: string;
  logoAlt: LocalizedText;
}

export interface ContactInfo {
  phoneDisplay: string;
  /** E.164 number used for tel: and sms: links. */
  phoneE164: string;
  email?: string;
  serviceArea: LocalizedText;
  nearbyCities: string[];
  /**
   * ZIP codes served (Dearborn, Dearborn Heights, Allen Park, Livonia...).
   * A trailing * matches a prefix ("482*" = Detroit). Others get a friendly
   * notice in the form, never a block.
   */
  serviceZips: string[];
  /** Optional street address; empty = not shown (decision on card 1). */
  address?: string;
  hours: { days: LocalizedText; time: LocalizedText }[];
  social: { name: string; url: string }[];
}

export interface LegalDoc {
  id: 'privacy' | 'accessibility';
  title: LocalizedText;
  body: LocalizedText;
}

export interface SiteContent {
  brand: Brand;
  sections: Section[];
  contact: ContactInfo;
  legal: LegalDoc[];
}

// ---------- Products and services ----------

export interface Product extends Orderable {
  name: LocalizedText;
  shortDescription: LocalizedText;
  longDescription?: LocalizedText;
  image: Image;
  benefits: LocalizedText[];
  idealFor: LocalizedText[];
  /** Sample price in USD per square foot, installed. */
  priceRange: { min: number; max: number };
  cta: CallToAction;
}

export interface Service extends Orderable {
  name: LocalizedText;
  shortDescription: LocalizedText;
  longDescription?: LocalizedText;
  image: Image;
  steps: LocalizedText[];
  cta: CallToAction;
}

// ---------- Other lists ----------

export interface Faq extends Orderable {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface Testimonial extends Orderable {
  name: string;
  /** What the job was: a product or service id. */
  subject: { kind: 'product' | 'service'; id: string };
  rating: 1 | 2 | 3 | 4 | 5;
  text: LocalizedText;
}

export interface GalleryImage extends Orderable {
  image: Image;
  orientation: 'portrait' | 'landscape';
  /** Marked provisional by Luis: to be replaced with a better photo. */
  replace?: boolean;
}

// ---------- One-off home page blocks ----------

export interface HomeContent {
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    subtitle: LocalizedText;
    image: Image;
    imageMobile: Image;
    primaryCta: CallToAction;
    secondaryCta: CallToAction;
    trustBadges: LocalizedText[];
  };
  whyUs: {
    points: { icon: string; title: LocalizedText; text: LocalizedText }[];
    stats: { value: string; label: LocalizedText }[];
    statsNote: LocalizedText;
    financing: { text: LocalizedText; cta: CallToAction };
  };
  shopAtHome: { text: LocalizedText; cta: CallToAction };
  reviews: { note: LocalizedText; averageRating: number };
  about: {
    title: LocalizedText;
    body: LocalizedText;
    image: Image;
    brandsLine: LocalizedText;
    cta: CallToAction;
  };
  faq: { closingCta: CallToAction };
}

/** Option for the quote form's "flooring type" field (card 19). */
export interface QuoteOption {
  id: string;
  kind: 'product' | 'service';
  label: LocalizedText;
}
