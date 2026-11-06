import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Faq } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { Icon } from '../icon/icon';

/**
 * Accessible accordion (button + region, aria-expanded/controls).
 * One answer open at a time by default; the panel height animates.
 */
@Component({
  selector: 'app-faq-accordion',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (faq of faqs(); track faq.id) {
      @let open = isOpen(faq.id);
      <div class="item" [class.is-open]="open">
        <h3>
          <button
            type="button"
            [id]="'faq-q-' + faq.id"
            [attr.aria-expanded]="open"
            [attr.aria-controls]="'faq-a-' + faq.id"
            (click)="toggle(faq.id)"
          >
            <span>{{ i18n.t(faq.question) }}</span>
            <app-icon name="chevron-down" class="chevron" />
          </button>
        </h3>
        <div class="panel" [id]="'faq-a-' + faq.id" role="region" [attr.aria-labelledby]="'faq-q-' + faq.id" [attr.inert]="open ? null : ''">
          <div class="panel__inner">
            <p>{{ i18n.t(faq.answer) }}</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      border-top: 1px solid var(--color-border);
    }
    .item {
      border-bottom: 1px solid var(--color-border);
    }
    h3 {
      margin: 0;
      font: inherit;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      width: 100%;
      min-height: 56px;
      padding: var(--space-4) 0;
      border: 0;
      background: none;
      color: var(--color-primary);
      font: 600 1.0625rem/1.4 var(--font-body);
      text-align: left;
      cursor: pointer;
    }
    .chevron {
      color: var(--color-accent-strong);
      transition: transform var(--duration-base) var(--ease-out);
    }
    .is-open .chevron {
      transform: rotate(180deg);
    }
    .panel {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--duration-base) var(--ease-out);
    }
    .is-open .panel {
      grid-template-rows: 1fr;
    }
    .panel__inner {
      overflow: hidden;
    }
    .panel p {
      margin: 0;
      padding: 0 var(--space-8) var(--space-5) 0;
      color: var(--color-text-muted);
      opacity: 0;
      transform: translateY(-6px);
      transition:
        opacity var(--duration-base) ease,
        transform var(--duration-base) var(--ease-out);
    }
    .is-open .panel p {
      opacity: 1;
      transform: none;
    }
  `,
})
export class FaqAccordion {
  protected readonly i18n = inject(LanguageService);
  readonly faqs = input.required<Faq[]>();
  /** Opening one question closes the others. */
  readonly singleOpen = input(true);

  private readonly openIds = signal<ReadonlySet<string>>(new Set());

  protected isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  toggle(id: string): void {
    this.openIds.update((set) => {
      if (set.has(id)) {
        const next = new Set(set);
        next.delete(id);
        return next;
      }
      return this.singleOpen() ? new Set([id]) : new Set([...set, id]);
    });
  }
}
