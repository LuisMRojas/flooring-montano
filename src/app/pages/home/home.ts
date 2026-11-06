import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT, SECTIONS, UI } from '../../core/data/site.data';
import { LanguageService } from '../../core/services/language.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';

/**
 * Single page with the 9 anchored sections.
 * Card 13 only lays out the anchors; real content arrives in card 17.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit {
  protected readonly i18n = inject(LanguageService);
  private readonly spy = inject(ScrollSpyService);
  protected readonly sections = [...SECTIONS].sort((a, b) => a.order - b.order);
  protected readonly contact = CONTACT;
  protected readonly ui = UI;

  protected readonly placeholder = {
    en: 'Section content coming in the next steps (Trello card 17).',
    es: 'El contenido de esta sección llega en los siguientes pasos (tarjeta 17 de Trello).',
  };

  ngAfterViewInit(): void {
    this.spy.observe(this.sections.map((s) => s.id));
  }
}
