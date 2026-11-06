import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Product, Service } from '../../core/models/content.models';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { BottomSheet } from '../../shared/ui/bottom-sheet/bottom-sheet';
import { CtaButton } from '../../shared/ui/cta-button/cta-button';
import { Icon } from '../../shared/ui/icon/icon';
import { ProcessSteps } from '../../shared/ui/process-steps/process-steps';
import { AboutSection } from './sections/about-section';
import { ContactSection } from './sections/contact-section';
import { FaqSection } from './sections/faq-section';
import { FlooringSection } from './sections/flooring-section';
import { GallerySection } from './sections/gallery-section';
import { HeroSection } from './sections/hero-section';
import { ReviewsSection } from './sections/reviews-section';
import { ServicesSection } from './sections/services-section';
import { WhyUsSection } from './sections/why-us-section';

/**
 * The single page. Which sections appear and in what order comes from
 * ContentService (src/content/site.json); each section is its own component.
 */
@Component({
  selector: 'app-home',
  imports: [
    TranslatePipe,
    BottomSheet,
    CtaButton,
    Icon,
    ProcessSteps,
    AboutSection,
    ContactSection,
    FaqSection,
    FlooringSection,
    GallerySection,
    HeroSection,
    ReviewsSection,
    ServicesSection,
    WhyUsSection,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly i18n = inject(LanguageService);
  private readonly content = inject(ContentService);
  private readonly spy = inject(ScrollSpyService);

  protected readonly sections = this.content.sections;

  // Detail panel (layout refined in card 18)
  protected readonly selected = signal<Product | Service | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly selectedProduct = computed(() => {
    const s = this.selected();
    return s && 'priceRange' in s ? s : null;
  });
  protected readonly selectedService = computed(() => {
    const s = this.selected();
    return s && 'steps' in s ? s : null;
  });

  constructor() {
    // Re-observe whenever the rendered sections change.
    effect(() => {
      const ids = this.sections().map((s) => s.id);
      queueMicrotask(() => this.spy.observe(ids));
    });
  }

  /** "01", "02"... in page order (home counts as 01). */
  protected kicker(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected showDetails(item: Product | Service): void {
    this.selected.set(item);
    this.detailOpen.set(true);
  }
}
