import { LocalizedText } from '../models/content.models';

// Interface labels only. All page content (sections, contact, products,
// services, FAQ, reviews, gallery...) lives in src/content/*.json.
// These labels move to ngx-translate files in Trello card 15.

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
  hours: { en: 'Hours', es: 'Horario' },
  contactUs: { en: 'Contact us', es: 'Contáctanos' },
  serviceArea: { en: 'Service area', es: 'Zona de servicio' },
  followUs: { en: 'Follow us', es: 'Síguenos' },
  close: { en: 'Close', es: 'Cerrar' },
  scroll: { en: 'Scroll', es: 'Desliza' },
  sample: {
    en: 'Sample website for demonstration',
    es: 'Sitio de ejemplo para demostración',
  },
  backToTop: { en: 'Back to top', es: 'Volver arriba' },
  homeLink: { en: 'Montano Flooring, back to top', es: 'Montano Flooring, volver arriba' },
  comingSoon: {
    en: 'Section content coming in the next steps (Trello card 17).',
    es: 'El contenido de esta sección llega en los siguientes pasos (tarjeta 17 de Trello).',
  },
} satisfies Record<string, LocalizedText>;
