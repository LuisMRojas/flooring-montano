import { SrcsetPipe, srcsetFor } from '../../../core/images/srcset.pipe';
import { ChangeDetectionStrategy, Component, DOCUMENT, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { Icon } from '../../../shared/ui/icon/icon';

/** #home: full-screen photo, headline, both CTAs and trust badges. */
@Component({
  selector: 'app-hero-section',
  imports: [SrcsetPipe, RouterLink, TranslatePipe, CtaButton, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let hero = content.home().hero;
    <section id="home" class="hero" aria-labelledby="home-title">
      <picture>
        <source media="(min-width: 768px), (orientation: landscape)" type="image/webp" [attr.srcset]="hero.image.src | srcset" sizes="100vw" />
        <source media="(min-width: 768px), (orientation: landscape)" [attr.srcset]="hero.image.src" />
        <img
          class="hero__img"
          [attr.srcset]="hero.imageMobile.src | srcset"
          sizes="100vw"
          [src]="hero.imageMobile.src"
          [alt]="i18n.t(hero.imageMobile.alt)"
          [width]="hero.imageMobile.width"
          [height]="hero.imageMobile.height"
          fetchpriority="high"
        />
      </picture>
      <div class="container hero__content">
        <p class="hero__eyebrow">{{ i18n.t(hero.eyebrow) }}</p>
        <h1 id="home-title">{{ i18n.t(hero.title) }}</h1>
        <p class="hero__sub">{{ i18n.t(hero.subtitle) }}</p>
        <div class="hero__actions">
          <app-cta [cta]="hero.primaryCta" variant="light" [large]="true" />
          <app-cta [cta]="hero.secondaryCta" variant="outline-light" [large]="true" />
        </div>
        <ul class="hero__badges">
          @for (badge of hero.trustBadges; track $index) {
            <li><app-icon name="check" />{{ i18n.t(badge) }}</li>
          }
        </ul>
      </div>
      <!-- Decorative: the secondary button already links to the next section. -->
      <a class="hero__scroll" routerLink="/" [fragment]="hero.secondaryCta.target" aria-hidden="true" tabindex="-1">
        {{ 'actions.scroll' | translate }}
        <svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
      </a>
    </section>
  `,
  styleUrl: './hero-section.scss',
})
export class HeroSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);

  constructor() {
    // While prerendering, put the hero photo in <head> as a preload so the
    // browser requests it before reading the rest of the page (faster LCP).
    if (isPlatformServer(inject(PLATFORM_ID))) this.preloadHeroImage(inject(DOCUMENT));
  }

  private preloadHeroImage(doc: Document): void {
    const hero = this.content.home().hero;
    const variants = [
      { image: hero.imageMobile, media: '(max-width: 767px) and (orientation: portrait)' },
      { image: hero.image, media: '(min-width: 768px), (orientation: landscape)' },
    ];
    for (const { image, media } of variants) {
      const link = doc.createElement('link');
      link.rel = 'preload';
      link.setAttribute('as', 'image');
      link.setAttribute('href', image.src);
      const srcset = srcsetFor(image.src);
      if (srcset) {
        link.setAttribute('imagesrcset', srcset);
        link.setAttribute('imagesizes', '100vw');
      }
      link.setAttribute('media', media);
      link.setAttribute('fetchpriority', 'high');
      doc.head.appendChild(link);
    }
  }
}
