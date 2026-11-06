import { SrcsetPipe } from '../../../core/images/srcset.pipe';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { Icon } from '../../../shared/ui/icon/icon';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/** #about: team photo with a framed accent, family story, brands line, contact CTA. */
@Component({
  selector: 'app-about-section',
  imports: [SrcsetPipe, Reveal, CtaButton, Icon, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let a = content.home().about;
    <section id="about" class="page-section" aria-labelledby="about-title">
      <div class="container about">
        <figure class="about__media" appReveal>
          <img
            [attr.srcset]="a.image.src | srcset"
            sizes="(min-width: 1024px) 45vw, 100vw"
            [src]="a.image.src"
            [alt]="i18n.t(a.image.alt)"
            [width]="a.image.width"
            [height]="a.image.height"
            loading="lazy"
            decoding="async"
          />
          <img class="about__logo" [attr.srcset]="content.brand().logo | srcset" sizes="88px" [src]="content.brand().logo" alt="" width="96" height="96" loading="lazy" decoding="async" />
        </figure>
        <div class="about__text">
          <app-section-header titleId="about-title" [kicker]="kicker()" [title]="a.title" />
          <p class="about__body" appReveal [revealDelay]="120">{{ i18n.t(a.body) }}</p>
          <p class="about__brands" appReveal [revealDelay]="200">
            <app-icon name="check" />
            {{ i18n.t(a.brandsLine) }}
          </p>
          <div appReveal [revealDelay]="260">
            <app-cta [cta]="a.cta" variant="primary" [arrow]="true" />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/tokens' as *;

    .about {
      display: grid;
      gap: var(--space-12);
      align-items: center;

      @include from($bp-desktop) {
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
      }
    }
    .about__media {
      position: relative;
      margin: 0 var(--space-4) var(--space-4) 0;

      // Wood-tone frame offset behind the photo
      &::before {
        content: '';
        position: absolute;
        inset: var(--space-4) calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) var(--space-4);
        z-index: -1;
        border: 2px solid var(--color-accent);
        border-radius: calc(var(--radius) + 6px);
      }

      > img:first-child {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: calc(var(--radius) + 6px);
        box-shadow: 0 18px 40px rgba(10, 25, 49, 0.2);
      }
    }
    .about__logo {
      position: absolute;
      left: var(--space-4);
      bottom: calc(-1 * var(--space-6));
      width: 88px;
      height: 88px;
      border: 4px solid #fff;
      border-radius: 50%;
      box-shadow: var(--shadow-card);
    }
    .about__body {
      margin: 0 0 var(--space-5);
      font-size: 1.125rem;
      line-height: 1.7;
    }
    .about__brands {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin: 0 0 var(--space-8);
      color: var(--color-text-muted);

      app-icon {
        color: var(--color-accent-strong);
      }
    }
  `,
})
export class AboutSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
}
