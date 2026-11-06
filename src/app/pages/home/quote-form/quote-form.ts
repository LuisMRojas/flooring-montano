import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  Injector,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { QuoteRequest, QuoteSender } from '../../../core/quote/quote-sender.service';
import {
  formatPhone,
  isServedZip,
  isZip,
  notPastDateValidator,
  phoneDigits,
  phoneValidator,
  sqftValidator,
  todayIso,
  zipValidator,
} from '../../../core/quote/quote.utils';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuoteIntentService } from '../../../core/services/quote-intent.service';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Icon } from '../../../shared/ui/icon/icon';

type FieldName = 'name' | 'phone' | 'zip' | 'flooringType' | 'email' | 'sqft' | 'preferredDate';

/** Which error text each validator maps to. */
const ERROR_KEYS: Record<FieldName, Record<string, string>> = {
  name: { required: 'form.errors.name', minlength: 'form.errors.name' },
  phone: { required: 'form.errors.required', phone: 'form.errors.phone' },
  zip: { required: 'form.errors.required', zip: 'form.errors.zip' },
  flooringType: { required: 'form.errors.required' },
  email: { email: 'form.errors.email' },
  sqft: { sqft: 'form.errors.sqft' },
  preferredDate: { date: 'form.errors.date' },
};

/**
 * Quote form (card 19), built for phones: 4 required fields, the rest
 * optional, the right keyboard and autofill on each field, errors shown after
 * leaving a field or pressing Send, focus moved to the first problem.
 * The flooring type is preselected from whichever "Get a quote" button was used.
 */
@Component({
  selector: 'app-quote-form',
  imports: [ReactiveFormsModule, TranslatePipe, FormField, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote-form.html',
  styleUrl: './quote-form.scss',
})
export class QuoteForm {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  private readonly intent = inject(QuoteIntentService);
  private readonly sender = inject(QuoteSender);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly today = todayIso();
  protected readonly timeOptions = [
    { value: 'morning', key: 'form.timeMorning' },
    { value: 'afternoon', key: 'form.timeAfternoon' },
    { value: 'late-afternoon', key: 'form.timeLate' },
  ];

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, phoneValidator]],
    zip: ['', [Validators.required, zipValidator]],
    flooringType: ['', Validators.required],
    email: ['', Validators.email],
    sqft: ['', sqftValidator],
    preferredDate: ['', notPastDateValidator],
    preferredTime: [''],
    comments: [''],
    /** Honeypot: hidden from people, bots fill it in. */
    company: [''],
  });

  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly sendError = signal(false);
  protected readonly success = signal<{ name: string; phone: string; demo: boolean } | null>(null);

  private readonly zip = toSignal(this.form.controls.zip.valueChanges, { initialValue: '' });
  private readonly type = toSignal(this.form.controls.flooringType.valueChanges, { initialValue: '' });

  /** Friendly notice (never a block) for a valid ZIP outside the service area. */
  protected readonly outOfArea = computed(() => {
    const z = this.zip();
    return isZip(z) && !isServedZip(z, this.content.contact().serviceZips);
  });

  /** Name of the product/service chosen with a "Get a quote" button, while it's still selected. */
  protected readonly preselectedName = computed(() => {
    const id = this.intent.preselected();
    if (!id || id !== this.type()) return null;
    return this.content.quoteOptions().find((o) => o.id === id)?.label ?? null;
  });

  constructor() {
    // A "Get a quote" button was pressed: preselect its product or service.
    effect(() => {
      const id = this.intent.preselected();
      if (!id) return;
      untracked(() => {
        if (this.content.quoteOptions().some((o) => o.id === id)) {
          this.form.controls.flooringType.setValue(id);
        }
      });
    });
  }

  /** Translation key of the error to show for a field, or null. */
  protected errorKey(field: FieldName): string | null {
    const control = this.form.controls[field];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    const first = Object.keys(control.errors)[0];
    return ERROR_KEYS[field][first] ?? 'form.errors.required';
  }

  protected formatPhoneField(): void {
    const c = this.form.controls.phone;
    if (phoneDigits(c.value)) c.setValue(formatPhone(c.value));
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.sendError.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstError();
      return;
    }

    const v = this.form.getRawValue();
    const result = { name: v.name.trim().split(/\s+/)[0], phone: formatPhone(v.phone) };

    // Bot filled the hidden field: pretend it worked, send nothing.
    if (v.company) {
      this.showSuccess({ ...result, demo: false });
      return;
    }

    const request: QuoteRequest = {
      name: v.name.trim(),
      phone: formatPhone(v.phone),
      zip: v.zip.trim(),
      flooringType: v.flooringType,
      email: v.email.trim() || undefined,
      sqft: v.sqft ? Number(String(v.sqft).replace(/,/g, '')) : undefined,
      preferredDate: v.preferredDate || undefined,
      preferredTime: v.preferredTime || undefined,
      comments: v.comments.trim() || undefined,
      inServiceArea: !this.outOfArea(),
      language: this.i18n.lang(),
    };

    this.sending.set(true);
    try {
      const { demo } = await this.sender.send(request);
      this.showSuccess({ ...result, demo });
    } catch {
      this.sendError.set(true);
    } finally {
      this.sending.set(false);
    }
  }

  protected reset(): void {
    this.form.reset();
    this.submitted.set(false);
    this.success.set(null);
    this.intent.preselected.set(null);
    afterNextRender(() => this.host.querySelector<HTMLElement>('input')?.focus(), { injector: this.injector });
  }

  private showSuccess(data: { name: string; phone: string; demo: boolean }): void {
    this.success.set(data);
    afterNextRender(() => this.host.querySelector<HTMLElement>('.success h3')?.focus(), {
      injector: this.injector,
    });
  }

  private focusFirstError(): void {
    afterNextRender(
      () => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }
}
