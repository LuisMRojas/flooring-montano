# Montano Flooring — sample website

Single-page, mobile-first website for **Montano Flooring LLC**, a (fictional) family flooring business serving **Dearborn, MI** and nearby areas. The page has one goal: get visitors to ask for a free estimate.

> All business data (phone number, reviews, figures, prices) is **sample content for demonstration**.

## Tech

- [Angular 22](https://angular.dev) (standalone components, signals, zoneless)
- SCSS, mobile-first (`min-width` media queries); breakpoints 768 / 1024 / 1200 / 1440 px
- Self-hosted fonts: Montserrat (headings) and Inter (text)
- English / Spanish switch (ngx-translate comes in a later step)

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
    core/data/site.data.ts     sections, contact info, service area, legal texts ({ en, es })
    core/services/             LanguageService, ScrollSpyService
    layout/                    header, bottom bar (mobile), footer, legal dialog
    pages/home/                the single page with the 9 anchored sections
    shared/                    small reusable pieces (logo mark)
  styles/                      design tokens and CSS custom properties
public/
  brand/                       logo and icons
  images/                      site photos
```

## Page sections

`#home` · `#flooring` · `#services` · `#why-us` · `#gallery` · `#reviews` · `#about` · `#faq` · `#contact`

The header menu, footer menu and buttons all link to these anchors. The menu is generated from `SECTIONS` in `site.data.ts`.

## Progress

Work is planned on a Trello board, one card per step:

- [x] 13. Project, header, menu and footer
- [ ] 14. Data model and data service
- [ ] 15. EN/ES translation (ngx-translate)
- [ ] 16. Reusable components
- [ ] 17. Page sections
- [ ] 18. Product / service detail panel
- [ ] 19. Quote form and contact buttons
- [ ] 20. Breakpoint checks
- [ ] 21. Accessibility
- [ ] 22. Local SEO and performance
- [ ] 23. Final review
- [ ] 24. Publish, HTTPS and analytics
