import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedText, Testimonial } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { Icon } from '../icon/icon';

/** Review: stars, quote, name and what the project was. */
@Component({
  selector: 'app-testimonial-card',
  imports: [TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = testimonial();
    <figure class="review">
      <p class="stars" role="img" [attr.aria-label]="'review.stars' | translate: { rating: t.rating }">
        @for (s of stars(); track $index) {
          <app-icon name="star" [filled]="true" [class.is-off]="!s" />
        }
      </p>
      <blockquote>
        <p>“{{ i18n.t(t.text) }}”</p>
      </blockquote>
      <figcaption>
        <span class="avatar" aria-hidden="true">{{ initials() }}</span>
        <span>
          <strong>{{ t.name }}</strong>
          @if (subject(); as s) {
            <span class="subject">{{ 'review.project' | translate: { subject: i18n.t(s) } }}</span>
          }
        </span>
      </figcaption>
    </figure>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .review {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      height: 100%;
      margin: 0;
      padding: var(--space-6);
      border-radius: calc(var(--radius) + 4px);
      background: var(--color-bg);
      box-shadow: var(--shadow-card);
    }
    .stars {
      display: flex;
      gap: 2px;
      margin: 0;
      color: #c98a2e;
      --icon-size: 1.125rem;
    }
    .is-off {
      color: var(--color-border);
    }
    blockquote {
      flex: 1;
      margin: 0;
      font-size: 1.0625rem;
      line-height: 1.6;
    }
    blockquote p {
      margin: 0;
    }
    figcaption {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    figcaption > span:last-child {
      display: grid;
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      font: 700 0.875rem var(--font-heading);
    }
    .subject {
      color: var(--color-text-muted);
      font-size: 0.9375rem;
    }
  `,
})
export class TestimonialCard {
  protected readonly i18n = inject(LanguageService);
  readonly testimonial = input.required<Testimonial>();
  /** Name of the product/service reviewed (from ContentService.subjectName). */
  readonly subject = input<LocalizedText>();

  protected readonly stars = computed(() => [1, 2, 3, 4, 5].map((n) => n <= this.testimonial().rating));
  protected readonly initials = computed(() =>
    this.testimonial()
      .name.split(/[\s&]+/)
      .filter((w) => /^[A-Za-zÀ-ÿ]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join(''),
  );
}
