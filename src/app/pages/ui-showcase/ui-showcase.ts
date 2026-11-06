import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { Product, Service } from '../../core/models/content.models';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { QuoteIntentService } from '../../core/services/quote-intent.service';
import { BottomSheet } from '../../shared/ui/bottom-sheet/bottom-sheet';
import { CtaButton } from '../../shared/ui/cta-button/cta-button';
import { FaqAccordion } from '../../shared/ui/faq-accordion/faq-accordion';
import { FormField } from '../../shared/ui/form-field/form-field';
import { Gallery } from '../../shared/ui/gallery/gallery';
import { Icon } from '../../shared/ui/icon/icon';
import { ProcessSteps } from '../../shared/ui/process-steps/process-steps';
import { ProductCard } from '../../shared/ui/product-card/product-card';
import { SectionHeader } from '../../shared/ui/section-header/section-header';
import { ServiceCard } from '../../shared/ui/service-card/service-card';
import { TestimonialCard } from '../../shared/ui/testimonial-card/testimonial-card';

/**
 * Internal page (/ui) showing every reusable component with the real content,
 * to review them before they are placed in the page (card 17).
 * Not linked from the site and marked noindex; remove before launch (card 23).
 */
@Component({
  selector: 'app-ui-showcase',
  imports: [
    TranslatePipe,
    BottomSheet,
    CtaButton,
    FaqAccordion,
    FormField,
    Gallery,
    Icon,
    ProcessSteps,
    ProductCard,
    SectionHeader,
    ServiceCard,
    TestimonialCard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-showcase.html',
  styleUrl: './ui-showcase.scss',
})
export class UiShowcase {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  protected readonly intent = inject(QuoteIntentService);

  protected readonly selected = signal<Product | Service | null>(null);
  protected readonly sheetOpen = signal(false);
  protected readonly selectedProduct = computed(() => {
    const s = this.selected();
    return s && 'priceRange' in s ? s : null;
  });
  protected readonly selectedService = computed(() => {
    const s = this.selected();
    return s && 'steps' in s ? s : null;
  });

  // Demo form state (real validation comes with card 19)
  protected readonly phoneError = signal<string | null>(null);

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  protected showDetails(item: Product | Service): void {
    this.selected.set(item);
    this.sheetOpen.set(true);
  }

  protected checkPhone(value: string): void {
    const digits = value.replace(/\D/g, '');
    this.phoneError.set(digits.length && digits.length < 10 ? 'Enter a 10-digit phone number / Escribe un teléfono de 10 dígitos' : null);
  }
}
