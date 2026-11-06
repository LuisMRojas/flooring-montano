import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate-loader';
import { Product } from '../../../core/models/content.models';
import { ContentService, DEFAULT_CONTENT } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuoteIntentService } from '../../../core/services/quote-intent.service';
import { DetailItem, DetailPanel } from './detail-panel';

describe('DetailPanel (card 18)', () => {
  let content: ContentService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslateService({ loader: provideTranslateLoader(StaticTranslateLoader), fallbackLang: 'en', lang: 'en' }),
      ],
    });
    content = TestBed.inject(ContentService);
    content.load(structuredClone(DEFAULT_CONTENT));
    TestBed.inject(LanguageService);
  });

  async function render(item: DetailItem) {
    const fixture = TestBed.createComponent(DetailPanel);
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('shows a product with price range, benefits, rooms and its review', async () => {
    const { el } = await render(content.product('hardwood')!);
    const text = el.textContent!;
    expect(el.querySelector('h2')!.textContent).toBe('Hardwood');
    expect(text).toContain('$6 – $12');
    expect(text).toContain('per sq ft, installed');
    expect(el.querySelectorAll('.ticks li').length).toBe(3);
    expect(el.querySelectorAll('.chip').length).toBe(3);
    expect(el.querySelectorAll('app-testimonial-card').length).toBe(1); // Sarah M. (hardwood)
    expect(text).toContain('Sample price');
  });

  it('shows a service with its steps and no price', async () => {
    const { el } = await render(content.service('installation')!);
    expect(el.querySelectorAll('app-process-steps li').length).toBe(4);
    expect(el.querySelector('.price')).toBeNull();
  });

  it('quote button goes to #contact, names the floor and preselects it', async () => {
    const { fixture, el } = await render(content.product('luxury-vinyl')!);
    let quoted = false;
    fixture.componentInstance.quote.subscribe(() => (quoted = true));
    const a = el.querySelector('.detail__cta a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/#contact');
    expect(a.textContent).toContain('Get a quote for luxury vinyl');
    a.click();
    expect(TestBed.inject(QuoteIntentService).preselected()).toBe('luxury-vinyl');
    expect(quoted).toBe(true);
  });

  it('services keep their own button text', async () => {
    const { el } = await render(content.service('estimate')!);
    expect(el.querySelector('.detail__cta a')!.textContent).toContain('Book a free estimate');
  });

  it('quote button text follows the language', async () => {
    const { fixture, el } = await render(content.product('tile')!);
    TestBed.inject(LanguageService).toggle();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('.detail__cta a')!.textContent).toContain('Cotizar baldosa');
    expect(el.textContent).toContain('por pie², instalado');
  });

  it('lists the other floors and switches to one', async () => {
    const { fixture, el } = await render(content.product('hardwood')!);
    let picked: DetailItem | null = null;
    fixture.componentInstance.selectItem.subscribe((i) => (picked = i));
    const buttons = Array.from(el.querySelectorAll('.other'));
    expect(buttons.map((b) => b.textContent!.trim())).toEqual(['Luxury vinyl', 'Laminate', 'Tile', 'Carpet']);
    (buttons[2] as HTMLButtonElement).click();
    expect(picked!.id).toBe('tile');
  });

  it('works for a product added only in the data file', async () => {
    const data = structuredClone(DEFAULT_CONTENT);
    const stone: Product = {
      ...structuredClone(data.products[0]),
      id: 'stone',
      order: 6,
      name: { en: 'Natural stone', es: 'Piedra natural' },
      priceRange: { min: 9, max: 20 },
      cta: { ...data.products[0].cta, prefill: 'stone' },
    };
    data.products.push(stone);
    content.load(data);
    const { el } = await render(content.product('stone')!);
    expect(el.textContent).toContain('$9 – $20');
    expect(el.querySelector('.detail__cta a')!.textContent).toContain('Get a quote for natural stone');
  });
});
