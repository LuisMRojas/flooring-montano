import { TranslatePipe } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { LegalDialog } from '../legal-dialog/legal-dialog';

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe, RouterLink, LegalDialog],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly i18n = inject(LanguageService);
  private readonly content = inject(ContentService);
  protected readonly brand = this.content.brand;
  protected readonly contact = this.content.contact;
  protected readonly legal = this.content.legal;
  protected readonly navItems = this.content.navItems;
  protected readonly year = new Date().getFullYear();
}
