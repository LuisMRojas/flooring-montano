import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CallToAction } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { QuoteIntentService } from '../../../core/services/quote-intent.service';
import { Icon } from '../icon/icon';

export type CtaVariant = 'primary' | 'outline' | 'light' | 'outline-light';

/**
 * Button that scrolls to a section (usually #contact). If the CTA carries a
 * `prefill`, that product/service is remembered for the quote form.
 *
 *   <app-cta [cta]="product.cta" variant="primary" />
 */
@Component({
  selector: 'app-cta',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [attr.class]="classes()" routerLink="/" [fragment]="cta().target" (click)="onClick()">
      <span>{{ i18n.t(cta().label) }}</span>
      @if (arrow()) {
        <app-icon name="arrow-right" class="cta__arrow" />
      }
    </a>
  `,
  styles: `
    :host {
      display: contents;
    }
    .cta__arrow {
      transition: transform var(--duration-fast) var(--ease-out);
    }
    @media (hover: hover) {
      a:hover .cta__arrow {
        transform: translateX(3px);
      }
    }
  `,
})
export class CtaButton {
  protected readonly i18n = inject(LanguageService);
  private readonly intent = inject(QuoteIntentService);

  readonly cta = input.required<CallToAction>();
  readonly variant = input<CtaVariant>('primary');
  /** Full width (forms, cards on phones). */
  readonly block = input(false);
  readonly arrow = input(false);
  readonly pressed = output<CallToAction>();

  protected readonly classes = computed(
    () => `btn btn--${this.variant()}${this.block() ? ' btn--block' : ''}`,
  );

  protected onClick(): void {
    this.intent.select(this.cta().prefill);
    this.pressed.emit(this.cta());
  }
}
