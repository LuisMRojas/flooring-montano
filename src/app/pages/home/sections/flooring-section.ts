import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Product } from '../../../core/models/content.models';
import { ContentService } from '../../../core/services/content.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/** #flooring: product cards (each with Details + Get a quote). */
@Component({
  selector: 'app-flooring-section',
  imports: [Reveal, ProductCard, SectionHeader],
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
      </div>
    </section>
  `,
})
export class FlooringSection {
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
  readonly details = output<Product>();
}
