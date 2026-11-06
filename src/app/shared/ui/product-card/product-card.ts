import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Product } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { CtaButton } from '../cta-button/cta-button';

/** Flooring type card: photo, name, short text, sample price, ideal rooms, Details + quote. */
@Component({
  selector: 'app-product-card',
  imports: [TranslatePipe, CtaButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <article class="ui-card" [attr.aria-labelledby]="'product-' + p.id">
      <div class="ui-card__media media">
        <img
          [src]="p.image.src"
          [alt]="i18n.t(p.image.alt)"
          [width]="p.image.width"
          [height]="p.image.height"
          loading="lazy"
          decoding="async"
        />
        <p class="price">
          <strong>{{ 'product.priceFrom' | translate: { min: p.priceRange.min } }}</strong>
          <span>{{ 'product.priceUnit' | translate }}</span>
        </p>
      </div>
      <div class="ui-card__body">
        <h3 [id]="'product-' + p.id">{{ i18n.t(p.name) }}</h3>
        <p class="desc">{{ i18n.t(p.shortDescription) }}</p>
        <ul class="chips" [attr.aria-label]="'product.idealFor' | translate">
          @for (room of p.idealFor; track $index) {
            <li class="chip">{{ i18n.t(room) }}</li>
          }
        </ul>
        <div class="ui-card__actions">
          <button type="button" class="btn btn--outline" (click)="details.emit(p)">
            {{ 'product.details' | translate }}
          </button>
          <app-cta [cta]="p.cta" variant="primary" />
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
    .price {
      position: absolute;
      left: var(--space-3);
      bottom: var(--space-3);
      display: inline-flex;
      align-items: baseline;
      gap: var(--space-1);
      margin: 0;
      padding: var(--space-1) var(--space-3);
      border-radius: 999px;
      background: rgba(10, 25, 49, 0.88);
      color: #fff;
      font-size: 0.875rem;
      backdrop-filter: blur(4px);
    }
    .price strong {
      font-size: 1rem;
    }
    .desc {
      color: var(--color-text-muted);
    }
  `,
})
export class ProductCard {
  protected readonly i18n = inject(LanguageService);
  readonly product = input.required<Product>();
  /** "Details" pressed: the page opens the detail panel (card 18). */
  readonly details = output<Product>();
}
