import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate-loader';
import { QuoteRequest, QuoteSender } from '../../../core/quote/quote-sender.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuoteIntentService } from '../../../core/services/quote-intent.service';
import { QuoteForm } from './quote-form';

describe('QuoteForm (card 19)', () => {
  let sent: QuoteRequest[];
  let fail: boolean;
  let fixture: ComponentFixture<QuoteForm>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    sent = [];
    fail = false;
    await TestBed.configureTestingModule({
      imports: [QuoteForm],
      providers: [
        provideRouter([]),
        provideTranslateService({ loader: provideTranslateLoader(StaticTranslateLoader), fallbackLang: 'en', lang: 'en' }),
        {
          provide: QuoteSender,
          useValue: {
            send: async (r: QuoteRequest) => {
              if (fail) throw new Error('network');
              sent.push(r);
              return { demo: true };
            },
          },
        },
      ],
    }).compileComponents();
    TestBed.inject(LanguageService);
    fixture = TestBed.createComponent(QuoteForm);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  const $ = <T extends HTMLElement>(sel: string) => el.querySelector(sel) as T;

  async function type(sel: string, value: string) {
    const input = $<HTMLInputElement>(sel);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function choose(sel: string, value: string) {
    const select = $<HTMLSelectElement>(sel);
    select.value = value;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  async function submit() {
    $<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }

  async function fillRequired() {
    await type('#q-name', 'Sarah Miller');
    await type('#q-phone', '313 555 0142');
    await type('#q-zip', '48126');
    await choose('#q-type', 'hardwood');
  }

  it('uses the right keyboard and autofill for each field', () => {
    expect($('#q-phone').getAttribute('type')).toBe('tel');
    expect($('#q-phone').getAttribute('autocomplete')).toBe('tel-national');
    expect($('#q-zip').getAttribute('inputmode')).toBe('numeric');
    expect($('#q-zip').getAttribute('autocomplete')).toBe('postal-code');
    expect($('#q-email').getAttribute('type')).toBe('email');
    expect($('#q-name').getAttribute('autocomplete')).toBe('name');
    expect($('#q-sqft').getAttribute('inputmode')).toBe('numeric');
    expect($('label[for="q-name"]').textContent).toContain('Full name');
  });

  it('offers every product and service plus "Not sure yet"', () => {
    const values = Array.from(el.querySelectorAll<HTMLOptionElement>('#q-type option')).map((o) => o.value);
    expect(values).toEqual(['', 'hardwood', 'luxury-vinyl', 'laminate', 'tile', 'carpet', 'estimate', 'installation', 'refinishing', 'not-sure']);
  });

  it('blocks sending until the 4 required fields are valid, and explains why', async () => {
    await submit();
    expect(sent.length).toBe(0);
    expect(el.textContent).toContain('Please check the highlighted fields.');
    expect($('#q-name').getAttribute('aria-invalid')).toBe('true');
    expect($('#q-phone').getAttribute('aria-invalid')).toBe('true');
    expect($('#q-zip').getAttribute('aria-invalid')).toBe('true');
    expect($('#q-type').getAttribute('aria-invalid')).toBe('true');
    expect($('#q-email').getAttribute('aria-invalid')).toBe('false'); // optional
    expect($('#q-name').getAttribute('aria-describedby')).toBe('q-name-error');
  });

  it('shows a clear message for a bad phone number after leaving the field', async () => {
    await type('#q-phone', '555-01');
    expect(el.textContent).toContain('Enter a 10-digit phone number.');
  });

  it('formats the phone number when leaving the field', async () => {
    await type('#q-phone', '3135550142');
    expect($<HTMLInputElement>('#q-phone').value).toBe('(313) 555-0142');
  });

  it('sends the request and confirms with the first name', async () => {
    await fillRequired();
    await type('#q-sqft', '1,200');
    await submit();
    expect(sent.length).toBe(1);
    expect(sent[0]).toMatchObject({
      name: 'Sarah Miller',
      phone: '(313) 555-0142',
      zip: '48126',
      flooringType: 'hardwood',
      flooringLabel: 'Hardwood',
      sqft: 1200,
      inServiceArea: true,
      language: 'en',
    });
    expect($('.success h3').textContent).toContain('Thanks, Sarah!');
    expect(el.textContent).toContain('(313) 555-0142');
    expect(el.textContent).toContain('sample website'); // demo mode note
  });

  it('warns about a ZIP outside the service area but still sends', async () => {
    await fillRequired();
    await type('#q-zip', '49503');
    expect(el.textContent).toContain('We mainly serve Dearborn and nearby areas');
    await submit();
    expect(sent.length).toBe(1);
    expect(sent[0].inServiceArea).toBe(false);
  });

  it('preselects the product chosen with a "Get a quote" button', async () => {
    TestBed.inject(QuoteIntentService).select('tile');
    fixture.detectChanges();
    await fixture.whenStable();
    expect($<HTMLSelectElement>('#q-type').value).toBe('tile');
    expect(el.textContent).toContain('Selected: Tile');
  });

  it('keeps the data and shows an error if sending fails', async () => {
    fail = true;
    await fillRequired();
    await submit();
    expect(el.textContent).toContain("We couldn't send your request");
    expect($<HTMLInputElement>('#q-name').value).toBe('Sarah Miller');
  });

  it('silently ignores bots that fill the hidden field', async () => {
    await fillRequired();
    await type('#q-company', 'Spam Inc');
    await submit();
    expect(sent.length).toBe(0);
    expect($('.success')).toBeTruthy();
  });

  it('can send another request after confirming', async () => {
    await fillRequired();
    await submit();
    ($('.success button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect($<HTMLInputElement>('#q-name').value).toBe('');
  });

  it('works in Spanish', async () => {
    TestBed.inject(LanguageService).toggle();
    fixture.detectChanges();
    await fixture.whenStable();
    expect($('label[for="q-phone"]').textContent).toContain('Teléfono');
    expect($('button[type="submit"]').textContent).toContain('Enviar mi solicitud');
  });
});
