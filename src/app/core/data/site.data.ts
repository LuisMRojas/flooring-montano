import { Brand, ContactInfo, LegalDoc, LocalizedText, NavItem } from '../models/site.models';

// Site-wide content. Products, services, FAQ and reviews move to JSON +
// a data service in Trello card 14; this file keeps the layout data.
// Everything here is sample content for demonstration.

export const BRAND: Brand = {
  name: 'Montano Flooring',
  legalName: 'Montano Flooring LLC',
  logo: 'brand/montano-flooring-logo.png',
  logoAlt: { en: 'Montano Flooring LLC logo', es: 'Logo de Montano Flooring LLC' },
};

/** The 9 sections of the single page, in order (Trello cards 3 and 5). */
export const SECTIONS: NavItem[] = [
  { id: 'home', order: 1, inNav: false, label: { en: 'Home', es: 'Inicio' } },
  { id: 'flooring', order: 2, inNav: true, label: { en: 'Flooring', es: 'Pisos' } },
  { id: 'services', order: 3, inNav: true, label: { en: 'Services', es: 'Servicios' } },
  { id: 'why-us', order: 4, inNav: true, label: { en: 'Why us', es: 'Por qué elegirnos' } },
  { id: 'gallery', order: 5, inNav: true, label: { en: 'Gallery', es: 'Galería' } },
  { id: 'reviews', order: 6, inNav: true, label: { en: 'Reviews', es: 'Reseñas' } },
  { id: 'about', order: 7, inNav: true, label: { en: 'About', es: 'Nosotros' } },
  { id: 'faq', order: 8, inNav: true, label: { en: 'FAQ', es: 'Preguntas' } },
  { id: 'contact', order: 9, inNav: false, label: { en: 'Contact', es: 'Contacto' } },
];

export const CONTACT: ContactInfo = {
  // 555-01xx numbers are reserved for fiction; 313 is the Dearborn area code.
  phoneDisplay: '(313) 555-0142',
  phoneE164: '+13135550142',
  serviceArea: {
    en: 'Serving Dearborn, MI & nearby areas',
    es: 'Atendemos Dearborn, MI y alrededores',
  },
  nearbyCities: ['Dearborn Heights', 'Allen Park', 'Detroit', 'Livonia'],
  hours: [
    {
      days: { en: 'Mon – Fri', es: 'Lun – Vie' },
      time: { en: '8:00 AM – 6:00 PM', es: '8:00 – 18:00' },
    },
    {
      days: { en: 'Saturday', es: 'Sábado' },
      time: { en: '9:00 AM – 2:00 PM', es: '9:00 – 14:00' },
    },
    { days: { en: 'Sunday', es: 'Domingo' }, time: { en: 'Closed', es: 'Cerrado' } },
  ],
  // Add real profile URLs here; empty list = no social icons shown.
  social: [],
};

/** Interface labels (move to ngx-translate files in Trello card 15). */
export const UI = {
  skipToContent: { en: 'Skip to main content', es: 'Saltar al contenido' },
  menu: { en: 'Menu', es: 'Menú' },
  openMenu: { en: 'Open menu', es: 'Abrir menú' },
  closeMenu: { en: 'Close menu', es: 'Cerrar menú' },
  mainNav: { en: 'Main navigation', es: 'Navegación principal' },
  quickActions: { en: 'Quick actions', es: 'Acciones rápidas' },
  call: { en: 'Call', es: 'Llamar' },
  text: { en: 'Text', es: 'Mensaje' },
  freeEstimate: { en: 'Free Estimate', es: 'Estimado gratis' },
  getFreeEstimate: { en: 'Get a free estimate', es: 'Pide tu presupuesto gratis' },
  language: { en: 'Language', es: 'Idioma' },
  switchTo: { en: 'Ver en español', es: 'View in English' },
  hours: { en: 'Hours', es: 'Horario' },
  contactUs: { en: 'Contact us', es: 'Contáctanos' },
  serviceArea: { en: 'Service area', es: 'Zona de servicio' },
  followUs: { en: 'Follow us', es: 'Síguenos' },
  close: { en: 'Close', es: 'Cerrar' },
  sample: {
    en: 'Sample website for demonstration',
    es: 'Sitio de ejemplo para demostración',
  },
  backToTop: { en: 'Back to top', es: 'Volver arriba' },
  homeLink: { en: 'Montano Flooring, back to top', es: 'Montano Flooring, volver arriba' },
} satisfies Record<string, LocalizedText>;

/** Approved legal texts (Trello card 12). */
export const LEGAL: LegalDoc[] = [
  {
    id: 'privacy',
    title: { en: 'Privacy', es: 'Privacidad' },
    body: {
      en: 'We collect your name, phone number, ZIP code and flooring type only to answer your estimate request. We never sell your information. To ask us to delete it, contact us using the form. (Sample text for demonstration.)',
      es: 'Recopilamos tu nombre, teléfono, código postal y tipo de piso solo para responder tu solicitud de estimado. Nunca vendemos tu información. Para pedir que la eliminemos, contáctanos por el formulario. (Texto de ejemplo para demostración.)',
    },
  },
  {
    id: 'accessibility',
    title: { en: 'Accessibility', es: 'Accesibilidad' },
    body: {
      en: "We want everyone to be able to use this site. It works on phones, tablets and computers, supports keyboard navigation and uses readable text and strong color contrast. If something doesn't work for you, tell us and we'll fix it. (Sample text.)",
      es: 'Queremos que todas las personas puedan usar este sitio. Funciona en celulares, tabletas y computadoras, admite navegación con teclado y usa texto legible y buen contraste. Si algo no te funciona, avísanos y lo corregimos. (Texto de ejemplo.)',
    },
  },
];
