import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UI } from '../../core/data/site.data';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { Reveal } from '../../shared/reveal/reveal.directive';

/**
 * Single page. The list of sections, their order and the menu all come from
 * ContentService (src/content/site.json); real section content arrives in card 17.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, Reveal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly i18n = inject(LanguageService);
  private readonly content = inject(ContentService);
  private readonly spy = inject(ScrollSpyService);

  protected readonly sections = this.content.sections;
  protected readonly home = this.content.home;
  protected readonly contact = this.content.contact;
  protected readonly ui = UI;

  constructor() {
    // Re-observe whenever the rendered sections change.
    effect(() => {
      const ids = this.sections().map((s) => s.id);
      queueMicrotask(() => this.spy.observe(ids));
    });
  }

  protected kicker(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
