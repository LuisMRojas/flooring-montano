import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND, CONTACT, LEGAL, SECTIONS, UI } from '../../core/data/site.data';
import { LanguageService } from '../../core/services/language.service';
import { LegalDialog } from '../legal-dialog/legal-dialog';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LegalDialog],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly i18n = inject(LanguageService);
  protected readonly brand = BRAND;
  protected readonly contact = CONTACT;
  protected readonly legal = LEGAL;
  protected readonly ui = UI;
  protected readonly navItems = SECTIONS.filter((s) => s.inNav).sort((a, b) => a.order - b.order);
  protected readonly year = new Date().getFullYear();
}
