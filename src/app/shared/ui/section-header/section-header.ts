import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LocalizedText } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../reveal/reveal.directive';

/**
 * Kicker + title + optional intro, fading in on scroll.
 * `titleId` lets the parent <section aria-labelledby> point at the heading.
 */
@Component({
  selector: 'app-section-header',
  imports: [Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-centered]': 'centered()', '[class.is-inverse]': 'inverse()' },
  template: `
    @if (kicker()) {
      <p class="kicker" aria-hidden="true" appReveal>{{ kicker() }}</p>
    }
    <h2 [id]="titleId()" appReveal [revealDelay]="80">{{ i18n.t(title()) }}</h2>
    @if (intro(); as text) {
      <p class="intro" appReveal [revealDelay]="160">{{ i18n.t(text) }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: 44rem;
      margin-bottom: var(--space-8);
    }
    :host(.is-centered) {
      margin-inline: auto;
      text-align: center;
    }
    .kicker {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      margin: 0 0 var(--space-3);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-accent-strong);
    }
    .kicker::before {
      content: '';
      width: 32px;
      height: 2px;
      background: var(--color-accent);
    }
    h2 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      color: var(--color-primary);
      margin-bottom: var(--space-3);
      text-wrap: balance;
    }
    .intro {
      margin: 0;
      font-size: 1.125rem;
      color: var(--color-text-muted);
    }
    :host(.is-inverse) h2,
    :host(.is-inverse) .intro {
      color: var(--color-on-primary);
    }
    :host(.is-inverse) .kicker {
      color: #e8c49f;
    }
  `,
})
export class SectionHeader {
  protected readonly i18n = inject(LanguageService);
  readonly title = input.required<LocalizedText>();
  readonly titleId = input.required<string>();
  /** Small label above the title, e.g. "02". */
  readonly kicker = input<string>();
  readonly intro = input<LocalizedText>();
  readonly centered = input(false);
  /** White text, for dark sections. */
  readonly inverse = input(false);
}
