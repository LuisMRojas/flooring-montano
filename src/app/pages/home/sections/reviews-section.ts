import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { Icon } from '../../../shared/ui/icon/icon';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';
import { TestimonialCard } from '../../../shared/ui/testimonial-card/testimonial-card';

/** #reviews: average rating, review cards and the "sample reviews" note (card 11). */
@Component({
  selector: 'app-reviews-section',
  imports: [TranslatePipe, Reveal, Icon, SectionHeader, TestimonialCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('reviews')!;
    @let r = content.home().reviews;
    <section id="reviews" class="page-section page-section--surface" aria-labelledby="reviews-title">
      <div class="container">
        <div class="head">
          <app-section-header titleId="reviews-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" />
          <div class="rating" appReveal>
            <span class="rating__value">{{ r.averageRating }}</span>
            <span>
              <span class="rating__stars" role="img" [attr.aria-label]="'review.stars' | translate: { rating: r.averageRating }">
                @for (n of [1, 2, 3, 4, 5]; track n) {
                  <app-icon name="star" [filled]="true" />
                }
              </span>
              <span class="rating__label">{{ 'reviews.average' | translate }}</span>
            </span>
          </div>
        </div>

        <ul class="card-grid">
          @for (t of content.testimonials(); track t.id) {
            <li appReveal [revealDelay]="($index % 3) * 90">
              <app-testimonial-card [testimonial]="t" [subject]="content.subjectName(t)" />
            </li>
          }
        </ul>
        <p class="note">{{ i18n.t(r.note) }}</p>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/tokens' as *;

    .head {
      display: grid;
      gap: var(--space-4);
      margin-bottom: var(--space-8);

      app-section-header {
        margin-bottom: 0;
      }

      @include from($bp-tablet) {
        grid-template-columns: 1fr auto;
        align-items: end;
      }
    }
    .rating {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      border-radius: 999px;
      background: var(--color-bg);
      box-shadow: var(--shadow-card);
      justify-self: start;
    }
    .rating__value {
      font: 700 2rem/1 var(--font-heading);
      color: var(--color-primary);
    }
    .rating__stars {
      display: flex;
      gap: 2px;
      color: #c98a2e;
      --icon-size: 1rem;
    }
    .rating__label {
      display: block;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }
    .note {
      margin: var(--space-6) 0 0;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }
  `,
})
export class ReviewsSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
}
