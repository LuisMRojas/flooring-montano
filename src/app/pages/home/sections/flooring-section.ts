import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Product } from '../../../core/models/content.models';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/** #flooring: product cards and the "shop at home" strip (mid-page CTA). */
@Component({
  selector: 'app-flooring-section',
  imports: [Reveal, CtaButton, ProductCard, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('flooring')!;
    <section id="flooring" class="page-section" aria-labelledby="flooring-title">
      <div class="container">
        <app-section-header titleId="flooring-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" />
        <ul class="card-grid">
          @for (p of content.products(); track p.id) {
            <li appReveal [revealDelay]="($index % 3) * 90">
              <app-product-card [product]="p" (details)="details.emit($event)" />
            </li>
          }
        </ul>
        @let shop = content.home().shopAtHome;
        <div class="cta-strip" appReveal>
          <p>{{ i18n.t(shop.text) }}</p>
          <app-cta [cta]="shop.cta" variant="light" [arrow]="true" />
        </div>
      </div>
    </section>
  `,
})
export class FlooringSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
  readonly details = output<Product>();
}
