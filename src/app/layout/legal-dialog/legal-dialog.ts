import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ContentService } from '../../core/services/content.service';
import { LegalDoc } from '../../core/models/content.models';
import { LanguageService } from '../../core/services/language.service';

/** Privacy / Accessibility texts opened from the footer, in a native <dialog> (card 12). */
@Component({
  imports: [TranslatePipe],
  selector: 'app-legal-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog class="dialog" aria-labelledby="legal-title" (click)="onBackdropClick($event)">
      @if (doc(); as d) {
        <div class="dialog__content">
          <h2 id="legal-title">{{ i18n.t(d.title) }}</h2>
          <p>{{ i18n.t(d.body) }}</p>
          <button type="button" class="btn btn--primary dialog__close" (click)="close()">
            {{ 'actions.close' | translate }}
          </button>
        </div>
      }
    </dialog>
  `,
  styles: `
    .dialog {
      width: min(92vw, 560px);
      padding: 0;
      border: 0;
      border-radius: var(--radius);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      color: var(--color-text);
    }
    .dialog::backdrop {
      background: rgba(10, 25, 49, 0.6);
    }
    .dialog__content {
      padding: var(--space-6);
    }
    h2 {
      font-size: 1.5rem;
      color: var(--color-primary);
    }
    p {
      margin: 0 0 var(--space-6);
    }
    .dialog__close {
      width: 100%;
    }
  `,
})
export class LegalDialog {
  protected readonly i18n = inject(LanguageService);
  private readonly content = inject(ContentService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly openId = signal<LegalDoc['id'] | null>(null);
  protected readonly doc = computed(() => this.content.legal().find((d) => d.id === this.openId()));

  open(id: LegalDoc['id']): void {
    this.openId.set(id);
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }
}
