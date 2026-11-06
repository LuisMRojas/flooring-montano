import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../icon/icon';

const CLOSE_DRAG_PX = 110;
const CLOSE_ANIMATION_MS = 260;

/**
 * Detail panel (card 4): a bottom sheet on phones and tablets that can be
 * dragged down to close, and a side panel from the right on desktop.
 * Built on a native modal <dialog>: focus is trapped, Esc closes it and focus
 * returns to the button that opened it.
 *
 *   <app-bottom-sheet [(open)]="detailOpen" [label]="productName">…</app-bottom-sheet>
 */
@Component({
  selector: 'app-bottom-sheet',
  imports: [TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.scss',
})
export class BottomSheet {
  private readonly document = inject(DOCUMENT);

  readonly open = model(false);
  /** Accessible name of the panel (e.g. the product name). */
  readonly label = input.required<string>();

  protected readonly closing = signal(false);
  protected readonly dragY = signal(0);
  protected readonly dragging = signal(false);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private dragStartY: number | null = null;
  private opener: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        this.opener = this.document.activeElement as HTMLElement | null;
        this.closing.set(false);
        this.dragY.set(0);
        dialog.showModal?.();
        this.document.body.classList.add('no-scroll');
      } else if (!this.open() && dialog.open && !this.closing()) {
        this.close();
      }
    });
  }

  /** Animated close. */
  close(): void {
    const dialog = this.dialog().nativeElement;
    if (!dialog.open || this.closing()) return;
    this.closing.set(true);
    const reduced = this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => dialog.close(), reduced ? 0 : CLOSE_ANIMATION_MS);
  }

  /** Fired by the native dialog once it is closed. */
  protected onClosed(): void {
    this.closing.set(false);
    this.dragY.set(0);
    this.open.set(false);
    this.document.body.classList.remove('no-scroll');
    this.opener?.focus?.();
  }

  /** Esc: run our animated close instead of the instant native one. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  // ----- Drag down to close (phones) -----
  protected onDragStart(event: PointerEvent): void {
    this.dragStartY = event.clientY;
    this.dragging.set(true);
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onDragMove(event: PointerEvent): void {
    if (this.dragStartY === null) return;
    this.dragY.set(Math.max(0, event.clientY - this.dragStartY));
  }

  protected onDragEnd(): void {
    if (this.dragStartY === null) return;
    this.dragStartY = null;
    this.dragging.set(false);
    if (this.dragY() > CLOSE_DRAG_PX) this.close();
    else this.dragY.set(0);
  }
}
