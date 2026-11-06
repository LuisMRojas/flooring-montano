import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { FaqAccordion } from '../../../shared/ui/faq-accordion/faq-accordion';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/**
 * #faq: accordion and the closing CTA ("Still have a question?" → #contact).
 * Phones: title, questions, button. Desktop: title and button on the left, questions on the right.
 */
@Component({
  selector: 'app-faq-section',
  imports: [Reveal, CtaButton, FaqAccordion, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('faq')!;
    <section id="faq" class="page-section page-section--surface" aria-labelledby="faq-title">
      <div class="container faq">
        <app-section-header class="faq__head" titleId="faq-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" />
        <app-faq-accordion class="faq__list" [faqs]="content.faqs()" appReveal />
        <div class="faq__cta" appReveal [revealDelay]="150">
          <app-cta [cta]="content.home().faq.closingCta" variant="primary" [large]="true" [arrow]="true" />
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/tokens' as *;

    .faq {
      display: grid;
      grid-template-areas:
        'head'
        'list'
        'cta';
      gap: var(--space-6);

      @include from($bp-desktop) {
        grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
        grid-template-rows: auto 1fr;
        grid-template-areas:
          'head list'
          'cta list';
        column-gap: 5rem;
        row-gap: 0;
        align-items: start;
      }
    }
    .faq__head {
      grid-area: head;
      margin-bottom: 0;
    }
    .faq__list {
      grid-area: list;
    }
    .faq__cta {
      grid-area: cta;

      @include from($bp-desktop) {
        margin-top: var(--space-6);
      }
    }
  `,
})
export class FaqSection {
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
}
