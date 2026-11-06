import { SrcsetPipe } from '../../../core/images/srcset.pipe';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslationObject } from '@ngx-translate/core';
import { TRANSLATIONS } from '../../../core/i18n/static-translate-loader';
import { CallToAction, Lang, Product, Service } from '../../../core/models/content.models';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { Icon } from '../../../shared/ui/icon/icon';
import { ProcessSteps } from '../../../shared/ui/process-steps/process-steps';
import { TestimonialCard } from '../../../shared/ui/testimonial-card/testimonial-card';

export type DetailItem = Product | Service;

export function isProduct(item: DetailItem): item is Product {
  return 'priceRange' in item;
}

/** "detail.quoteFor" → value in a translation file. */
function lookup(file: TranslationObject, key: string): string {
  const value = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], file);
  return typeof value === 'string' ? value : key;
}

/** Replace {{name}}-style params. */
function fill(pattern: string, params: Record<string, string>): string {
  return pattern.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => params[k] ?? '');
}

/**
 * Content of the detail panel (card 18) for a product or a service, built
 * entirely from ContentService: adding a product or service to the JSON
 * gives it a detail panel with no other change.
 *
 * Product: photo, sample price range, description, benefits, ideal rooms.
 * Service: photo, description, steps.
 * Both: related reviews, quick switch to the other products/services, and a
 * sticky quote button that preselects the item in the form.
 */
@Component({
  selector: 'app-detail-panel',
  imports: [SrcsetPipe, TranslatePipe, CtaButton, Icon, ProcessSteps, TestimonialCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail-panel.html',
  styleUrl: './detail-panel.scss',
})
export class DetailPanel {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly item = input.required<DetailItem>();
  /** Another product/service picked from the "Other floors/services" row. */
  readonly selectItem = output<DetailItem>();
  /** The quote button was pressed (the page closes the panel). */
  readonly quote = output<CallToAction>();

  protected readonly product = computed(() => {
    const i = this.item();
    return isProduct(i) ? i : null;
  });
  protected readonly service = computed(() => {
    const i = this.item();
    return isProduct(i) ? null : i;
  });

  /** Reviews whose project was this product or service. */
  protected readonly reviews = computed(() =>
    this.content.testimonials().filter((t) => t.subject.id === this.item().id),
  );

  /** The other items of the same kind, for quick switching. */
  protected readonly others = computed<DetailItem[]>(() => {
    const id = this.item().id;
    const list: DetailItem[] = this.product() ? this.content.products() : this.content.services();
    return list.filter((i) => i.id !== id);
  });

  /**
   * Products: "Get a quote for hardwood" / "Cotizar madera".
   * Services keep their own label (e.g. "Book a free estimate").
   */
  protected readonly cta = computed<CallToAction>(() => {
    const item = this.item();
    if (!isProduct(item)) return item.cta;
    const label = (lang: Lang) =>
      fill(lookup(TRANSLATIONS[lang], 'detail.quoteFor'), { name: item.name[lang].toLowerCase() });
    return { ...item.cta, label: { en: label('en'), es: label('es') } };
  });

  constructor() {
    // Switching item inside the open panel: start again from the top.
    effect(() => {
      this.item();
      this.host.closest('.sheet__content')?.scrollTo?.({ top: 0 });
    });
  }
}
