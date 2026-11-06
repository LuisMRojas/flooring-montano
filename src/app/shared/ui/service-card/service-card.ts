import { SrcsetPipe } from '../../../core/images/srcset.pipe';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Service } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { CtaButton } from '../cta-button/cta-button';
import { Icon } from '../icon/icon';

/** Service card: photo, number, name, short text, step count, "How it works" + CTA. */
@Component({
  selector: 'app-service-card',
  imports: [SrcsetPipe, TranslatePipe, CtaButton, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = service();
    <article class="ui-card" [attr.aria-labelledby]="'service-' + s.id">
      <div class="ui-card__media media">
        <img
          [attr.srcset]="s.image.src | srcset"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          [src]="s.image.src"
          [alt]="i18n.t(s.image.alt)"
          [width]="s.image.width"
          [height]="s.image.height"
          loading="lazy"
          decoding="async"
        />
        @if (index() !== null) {
          <span class="number" aria-hidden="true">{{ number() }}</span>
        }
      </div>
      <div class="ui-card__body">
        <h3 [id]="'service-' + s.id">{{ i18n.t(s.name) }}</h3>
        <p class="desc">{{ i18n.t(s.shortDescription) }}</p>
        <p class="steps">
          <app-icon name="check" />
          {{ 'service.steps' | translate: { count: s.steps.length } }}
        </p>
        <div class="ui-card__actions actions">
          <button type="button" class="btn btn--outline" (click)="details.emit(s)">
            {{ 'service.details' | translate }}
          </button>
          <app-cta [cta]="s.cta" variant="primary" />
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .media {
      aspect-ratio: 4 / 3;
    }
    .number {
      position: absolute;
      top: var(--space-3);
      left: var(--space-3);
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      font: 700 1rem var(--font-heading);
    }
    .desc {
      color: var(--color-text-muted);
    }
    // Service CTAs are longer ("Book a free estimate"): always stack the buttons.
    .actions {
      grid-template-columns: 1fr;
    }
    .steps {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 600;
      color: var(--color-accent-strong);
    }
  `,
})
export class ServiceCard {
  protected readonly i18n = inject(LanguageService);
  readonly service = input.required<Service>();
  /** Position in the list (0-based) to show "01", "02"...; null hides it. */
  readonly index = input<number | null>(null);
  readonly details = output<Service>();

  protected number(): string {
    return String((this.index() ?? 0) + 1).padStart(2, '0');
  }
}
