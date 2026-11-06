import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Label + control + hint + error, with the ids wired for screen readers.
 * The control is projected; give it `[id]="fieldId"` and
 * `[attr.aria-describedby]="field.describedBy()"`.
 *
 *   <app-form-field #f fieldId="phone" [label]="'form.phone' | translate" [error]="phoneError()">
 *     <input class="input" id="phone" type="tel" [attr.aria-describedby]="f.describedBy()" />
 *   </app-form-field>
 */
@Component({
  selector: 'app-form-field',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.has-error]': '!!error()' },
  template: `
    <label class="field__label" [attr.for]="fieldId()">
      {{ label() }}
      @if (required()) {
        <span class="field__required" aria-hidden="true">*</span>
      } @else {
        <span class="field__optional">({{ 'form.optional' | translate }})</span>
      }
    </label>
    <ng-content />
    @if (hint()) {
      <p class="field__hint" [id]="fieldId() + '-hint'">{{ hint() }}</p>
    }
    <p class="field__error" [id]="fieldId() + '-error'" aria-live="polite">{{ error() }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-2);
    }
    .field__label {
      font-weight: 600;
    }
    .field__required {
      color: var(--color-accent-strong);
      margin-left: 2px;
    }
    .field__optional {
      margin-left: var(--space-1);
      font-weight: 400;
      color: var(--color-text-muted);
    }
    .field__hint {
      margin: 0;
      color: var(--color-text-muted);
    }
    .field__error {
      margin: 0;
      min-height: 0;
      color: #b42318;
      font-weight: 600;
    }
    .field__error:empty {
      display: none;
    }
  `,
})
export class FormField {
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly hint = input<string>();
  /** Translated error message; empty = valid. */
  readonly error = input<string | null>(null);

  readonly describedBy = computed(() =>
    [this.hint() ? `${this.fieldId()}-hint` : '', this.error() ? `${this.fieldId()}-error` : '']
      .filter(Boolean)
      .join(' ') || null,
  );
}
