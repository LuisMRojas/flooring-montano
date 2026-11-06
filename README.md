# Montano Flooring — sample website

Single-page, mobile-first website for **Montano Flooring LLC**, a (fictional) family flooring business serving **Dearborn, MI** and nearby areas. The page has one goal: get visitors to ask for a free estimate.

> All business data (phone number, reviews, figures, prices) is **sample content for demonstration**.

## Tech

- [Angular 22](https://angular.dev) (standalone components, signals, zoneless)
- SCSS, mobile-first (`min-width` media queries); breakpoints 768 / 1024 / 1200 / 1440 px
- Self-hosted fonts: Montserrat (headings) and Inter (text)
- English / Spanish with [ngx-translate](https://github.com/ngx-translate/core): English by default, choice saved in the browser

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm run start:phone  # same, reachable from a phone on your Wi-Fi: http://<your-PC-IP>:4300
npm test           # unit tests (Vitest)
npm run build      # production build in dist/
```

## Structure

```
src/
  app/
    core/i18n/                 ngx-translate loader for the interface texts
    core/models/               content types (Product, Service, Faq, Testimonial...)
    core/services/             ContentService, LanguageService, ScrollSpyService
    layout/                    header, bottom bar (mobile), footer, legal dialog
    pages/home/                the single page; sections/ has one component per section
    shared/ui/                 reusable components (see below)
    shared/                    logo mark, appReveal directive
  content/                     all texts and data (JSON), see "Editing content"
  i18n/                        interface texts: en.json, es.json (menu, buttons, labels)
  styles/                      design tokens, CSS custom properties and motion
public/
  brand/                       logo and icons
  images/                      site photos
```

## Editing content

All texts and data live in **`src/content/`**, one JSON file per kind of content. Every visible text is a pair `{ "en": "...", "es": "..." }`.

| File | What it holds |
| --- | --- |
| `site.json` | brand, the 9 sections (order, menu), contact info, service area, hours, legal texts |
| `home.json` | hero, why us, stats, financing, shop at home, about, review note |
| `products.json` | the 5 flooring types (name, description, photo, benefits, ideal rooms, sample price) |
| `services.json` | the 3 services (name, description, photo, steps) |
| `faqs.json` | questions and answers |
| `testimonials.json` | sample reviews (each linked to a product or service id) |
| `gallery.json` | gallery photos with alt text and orientation |

Every record in a list has `id`, `order` and `visible`:

- **Add** a product, service, FAQ, review or photo: copy a record, give it a new `id` and `order`. The menu, cards, detail panel and quote form options pick it up.
- **Hide** something without deleting it: `"visible": false`.
- **Reorder**: change `order`.
- A section whose list is empty (for example no reviews) disappears from the page and the menu.

Buttons say where they go with `"target"` (a section id such as `"contact"`), and can preselect an option in the quote form with `"prefill"`. `npm test` checks that every text has both languages, ids are unique and every button points to a real section.

## Screen sizes

Mobile-first: phones are the base, larger screens add to it. Checked at 360, 375, 390, 768, 1024, 1200, 1440 and 1920 px wide, phone held sideways (740×360), and 200% zoom: no horizontal scrolling, nothing cut off, every tap target at least 48 px.

| Width | Layout |
| --- | --- |
| < 768 | one column, hamburger menu, bottom bar (Call / Free Estimate), gallery you swipe |
| 768–1023 | two-column cards and gallery, still hamburger + bottom bar |
| 1024–1199 | three-column cards, no bottom bar, hamburger + Free Estimate button |
| ≥ 1200 | horizontal menu |
| phone sideways | smaller headline, buttons side by side, slimmer bottom bar, wide hero photo |

To try it on a real phone: `npm run start:phone`, then open `http://<your-PC-IP>:4300` on a phone connected to the same Wi-Fi (Windows may ask to allow Node.js through the firewall).

## Accessibility

Lighthouse accessibility: **100** on mobile and desktop. Covered: contrast (text ≥ 4.5:1, form borders ≥ 3:1, hero text over the photo with a darkened gradient), 48 px tap targets, skip link, visible focus, keyboard-only use (menu traps focus while open, Esc closes menus, panels and the photo viewer, focus returns to the button that opened them), labelled form fields with linked errors, alt text on every photo, ARIA on the menu, accordion and dialogs, `prefers-reduced-motion`, and 200% zoom.

To re-check: `npm run start:prod`, then in another terminal `npm run audit:a11y`.

## Components

Reusable pieces in `src/app/shared/ui/`. They take their data as inputs and have no fixed texts. Open **`/ui`** (e.g. http://localhost:4200/ui) to see them all with the real content; this page is not linked and is marked `noindex`.

| Component | What it does |
| --- | --- |
| `app-cta` | Button to a section; remembers the product/service for the quote form |
| `app-section-header` | Kicker, title and intro with scroll reveal |
| `app-product-card` / `app-service-card` | Photo, text, price or steps, Details + quote |
| `app-testimonial-card` | Stars (accessible), quote, initials, project |
| `app-process-steps` | Numbered steps: vertical on phones, horizontal from 768 px |
| `app-faq-accordion` | One answer open at a time, ARIA wired |
| `app-gallery` | Swipe strip on phones, grid on larger screens, full-screen viewer |
| `app-bottom-sheet` | Detail panel: bottom sheet you can drag down on phones, side panel on desktop |
| `app-form-field` | Label, hint and error linked to the control |
| `app-icon` | Line icons |

## Quote requests

The form posts JSON to the URL in `QUOTE_ENDPOINT` (`src/app/core/quote/quote-sender.service.ts`), for example a Formspree or Netlify form endpoint. **Until one is set, the form runs in demo mode**: it validates and confirms, but nothing is sent, and the confirmation says so.

## Languages

There are two kinds of text, both in English and Spanish:

- **Interface** (menu, buttons, screen-reader labels, footer): `src/i18n/en.json` and `src/i18n/es.json`, used in templates as `{{ 'actions.call' | translate }}`. Both files must have the same keys.
- **Content** (products, services, FAQ, reviews…): `{ "en", "es" }` pairs in `src/content/`, shown with `i18n.t(...)`.

`npm test` fails if a key is missing in one language, if a text is empty, or if any English interface text is still visible after switching to Spanish.

## Page sections

`#home` · `#flooring` · `#services` · `#why-us` · `#gallery` · `#reviews` · `#about` · `#faq` · `#contact`

The header menu, footer menu and buttons all link to these anchors. The menu is generated from `sections` in `src/content/site.json`.

## Progress

Work is planned on a Trello board, one card per step:

- [x] 13. Project, header, menu and footer
- [x] 14. Data model and data service
- [x] 15. EN/ES translation (ngx-translate)
- [x] 16. Reusable components
- [x] 17. Page sections
- [x] 18. Product / service detail panel
- [x] 19. Quote form and contact buttons
- [x] 20. Breakpoint checks (real-phone test pending)
- [x] 21. Accessibility (Lighthouse 100)
- [ ] 22. Local SEO and performance
- [ ] 23. Final review
- [ ] 24. Publish, HTTPS and analytics
