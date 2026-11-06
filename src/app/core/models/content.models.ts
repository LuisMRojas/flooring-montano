export type Lang = 'en' | 'es';

/** Every visible text is an { en, es } pair (Trello card 8). */
export interface LocalizedText {
  en: string;
  es: string;
}

export interface NavItem {
  /** Section anchor id, e.g. "flooring" → #flooring. */
  id: string;
  label: LocalizedText;
  order: number;
  /** Shown in the header menu (some sections are only reachable by buttons). */
  inNav: boolean;
}

export interface ContactInfo {
  phoneDisplay: string;
  /** E.164 number used for tel: and sms: links. */
  phoneE164: string;
  email?: string;
  serviceArea: LocalizedText;
  nearbyCities: string[];
  hours: { days: LocalizedText; time: LocalizedText }[];
  social: { name: string; url: string }[];
}

export interface Brand {
  name: string;
  legalName: string;
  logo: string;
  logoAlt: LocalizedText;
}

export interface LegalDoc {
  id: 'privacy' | 'accessibility';
  title: LocalizedText;
  body: LocalizedText;
}
