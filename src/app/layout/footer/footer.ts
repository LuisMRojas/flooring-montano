import { SrcsetPipe } from '../../core/images/srcset.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { LegalDialog } from '../legal-dialog/legal-dialog';

@Component({
  selector: 'app-footer',
  imports: [SrcsetPipe, TranslatePipe, RouterLink, LegalDialog],
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
  protected readonly products = this.content.products;
  protected readonly serviceItems = this.content.services;
  protected readonly flooring = computed(() => this.content.section('flooring'));
  protected readonly services = computed(() => this.content.section('services'));
  /** Every other section (Why us, Gallery, Reviews, About, FAQ...), from the data. */
  protected readonly company = computed(() =>
    this.content.sections().filter((s) => !['home', 'flooring', 'services', 'contact'].includes(s.id)),
  );
  protected readonly year = new Date().getFullYear();
}
