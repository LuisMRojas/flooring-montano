import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../core/i18n/static-translate-loader';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { QuoteIntentService } from '../../core/services/quote-intent.service';
import { BottomSheet } from './bottom-sheet/bottom-sheet';
import { CtaButton } from './cta-button/cta-button';
import { FaqAccordion } from './faq-accordion/faq-accordion';
import { FormField } from './form-field/form-field';
import { Gallery } from './gallery/gallery';
import { ProcessSteps } from './process-steps/process-steps';
import { ProductCard } from './product-card/product-card';
import { ServiceCard } from './service-card/service-card';
import { TestimonialCard } from './testimonial-card/testimonial-card';

describe('UI components', () => {
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
    TestBed.inject(LanguageService); // applies the language to ngx-translate
  });

  async function render<T>(type: Type<T>, inputs: Record<string, unknown>): Promise<ComponentFixture<T>> {
    const fixture = TestBed.createComponent(type);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  const el = (f: ComponentFixture<unknown>) => f.nativeElement as HTMLElement;

  it('CTA links to its section and remembers the preselected product', async () => {
    const f = await render(CtaButton, { cta: content.product('tile')!.cta });
    const a = el(f).querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/#contact');
    expect(a.textContent).toContain('Get a quote');
    a.click();
    expect(TestBed.inject(QuoteIntentService).preselected()).toBe('tile');
  });

  it('product card shows name, sample price, rooms, and emits details', async () => {
    const product = content.product('hardwood')!;
    const f = await render(ProductCard, { product });
    let opened: unknown = null;
    f.componentInstance.details.subscribe((p) => (opened = p));
    const text = el(f).textContent!;
    expect(text).toContain('Hardwood');
    expect(text).toContain('From $6');
    expect(el(f).querySelectorAll('.chip').length).toBe(3);
    expect(el(f).querySelector('img')!.getAttribute('loading')).toBe('lazy');
    (el(f).querySelector('button') as HTMLButtonElement).click();
    expect(opened).toBe(product);
  });

  it('product card switches to Spanish', async () => {
    const f = await render(ProductCard, { product: content.product('hardwood')! });
    TestBed.inject(LanguageService).toggle();
    f.detectChanges();
    await f.whenStable();
    const text = el(f).textContent!;
    expect(text).toContain('Madera');
    expect(text).toContain('Desde $6');
    expect(text).toContain('Ver detalles');
  });

  it('service card numbers itself and counts steps', async () => {
    const f = await render(ServiceCard, { service: content.service('installation')!, index: 1 });
    expect(el(f).querySelector('.number')!.textContent).toBe('02');
    expect(el(f).textContent).toContain('4 steps');
  });

  it('review card has an accessible star rating and initials', async () => {
    const t = content.testimonials()[2];
    const f = await render(TestimonialCard, { testimonial: t, subject: content.subjectName(t) });
    expect(el(f).querySelector('.stars')!.getAttribute('aria-label')).toBe('5 out of 5 stars');
    expect(el(f).querySelector('.avatar')!.textContent).toBe('MT');
    expect(el(f).textContent).toContain('Project: Repair & refinishing');
  });

  it('FAQ accordion opens one answer at a time with correct ARIA', async () => {
    const f = await render(FaqAccordion, { faqs: content.faqs() });
    const buttons = Array.from(el(f).querySelectorAll('button'));
    const expanded = () => buttons.map((b) => b.getAttribute('aria-expanded'));
    expect(buttons[0].getAttribute('aria-controls')).toBe('faq-a-cost');
    buttons[0].click();
    f.detectChanges();
    expect(expanded().filter((e) => e === 'true').length).toBe(1);
    buttons[3].click();
    f.detectChanges();
    expect(expanded()[0]).toBe('false');
    expect(expanded()[3]).toBe('true');
    expect(el(f).querySelector('#faq-a-cost')!.hasAttribute('inert')).toBe(true);
  });

  it('gallery viewer moves forward and backward and wraps around', async () => {
    const f = await render(Gallery, { images: content.gallery() });
    const g = f.componentInstance;
    const count = () => {
      f.detectChanges();
      return el(f).querySelector('.viewer__count')?.textContent?.trim();
    };
    g.open(7);
    expect(count()).toBe('8 of 8');
    g.next();
    expect(count()).toBe('1 of 8');
    g.previous();
    expect(count()).toBe('8 of 8');
  });

  it('process steps renders numbered items in order', async () => {
    const f = await render(ProcessSteps, { steps: content.service('installation')!.steps });
    const items = Array.from(el(f).querySelectorAll('li')).map(
      (li) => `${li.querySelector('.num')!.textContent!.trim()} ${li.querySelector('.label')!.textContent!.trim()}`,
    );
    expect(items).toEqual(['1 Remove old floor', '2 Prepare subfloor', '3 Install', '4 Final clean-up']);
  });

  it('form field links hint and error to the control', async () => {
    const f = await render(FormField, { fieldId: 'phone', label: 'Phone', hint: 'We call or text', error: 'Too short' });
    expect(f.componentInstance.describedBy()).toBe('phone-hint phone-error');
    expect(el(f).querySelector('label')!.getAttribute('for')).toBe('phone');
    f.componentRef.setInput('error', null);
    f.componentRef.setInput('hint', undefined);
    expect(f.componentInstance.describedBy()).toBeNull();
  });

  it('detail panel never leaves the page scroll-locked when removed while open', async () => {
    const f = await render(BottomSheet, { label: 'Hardwood', open: true });
    expect(document.body.classList.contains('no-scroll')).toBe(true);
    f.destroy();
    expect(document.body.classList.contains('no-scroll')).toBe(false);
  });
});
