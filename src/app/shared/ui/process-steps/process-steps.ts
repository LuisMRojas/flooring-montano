import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LocalizedText } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../reveal/reveal.directive';

/**
 * Numbered steps (e.g. Remove → Prepare → Install → Clean up).
 * Vertical on phones, horizontal with a connecting line from 768 px.
 */
@Component({
  selector: 'app-process-steps',
  imports: [Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-compact]': 'compact()', '[style.--steps]': 'steps().length' },
  template: `
    <ol>
      @for (step of steps(); track $index) {
        <li appReveal [revealDelay]="$index * 90">
          <span class="num" aria-hidden="true">{{ $index + 1 }}</span>
          <span class="label">{{ i18n.t(step) }}</span>
        </li>
      }
    </ol>
  `,
  styleUrl: './process-steps.scss',
})
export class ProcessSteps {
  protected readonly i18n = inject(LanguageService);
  readonly steps = input.required<LocalizedText[]>();
  /** Always vertical (inside the narrow detail panel). */
  readonly compact = input(false);
}
