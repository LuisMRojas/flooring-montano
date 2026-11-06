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
    pages/home/                the single page with the 9 anchored sections
    shared/                    small reusable pieces (logo mark, appReveal)
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
- [ ] 16. Reusable components
- [ ] 17. Page sections
- [ ] 18. Product / service detail panel
- [ ] 19. Quote form and contact buttons
- [ ] 20. Breakpoint checks
- [ ] 21. Accessibility
- [ ] 22. Local SEO and performance
- [ ] 23. Final review
- [ ] 24. Publish, HTTPS and analytics
