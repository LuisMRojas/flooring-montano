import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GalleryImage } from '../../../core/models/content.models';
import { LanguageService } from '../../../core/services/language.service';
import { Icon } from '../icon/icon';

const SWIPE_MIN_PX = 50;

/**
 * Photo gallery.
 * - Phones: horizontal strip you swipe (scroll-snap), with an "n of N" counter.
 * - From 768 px: even grid of tiles (2 columns, 4 from 1024 px).
 * - Tap a photo: full-screen viewer with swipe, arrows, keyboard (← → Esc).
 */
@Component({
  selector: 'app-gallery',
  imports: [TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  protected readonly i18n = inject(LanguageService);
  readonly images = input.required<GalleryImage[]>();

  /** Index of the photo shown in the strip (phones). */
  protected readonly stripIndex = signal(0);
  /** Index of the photo open in the viewer, or null. */
  protected readonly viewerIndex = signal<number | null>(null);
  protected readonly current = computed(() => {
    const i = this.viewerIndex();
    return i === null ? null : this.images()[i];
  });

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('viewer');
  private pointerStartX: number | null = null;
  private opener: HTMLElement | null = null;

  protected onTrackScroll(): void {
    const el = this.track().nativeElement;
    const slide = el.firstElementChild as HTMLElement | null;
    if (!slide) return;
    const step = slide.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
    this.stripIndex.set(Math.min(this.images().length - 1, Math.round(el.scrollLeft / step)));
  }

  open(index: number, event?: Event): void {
    this.opener = (event?.currentTarget as HTMLElement) ?? null;
    this.viewerIndex.set(index);
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) dialog.showModal?.();
  }

  close(): void {
    this.dialog().nativeElement.close?.();
  }

  /** Native <dialog> close (button, Esc, backdrop): restore focus to the photo. */
  protected onClosed(): void {
    this.viewerIndex.set(null);
    this.opener?.focus();
  }

  next(): void {
    this.step(1);
  }

  previous(): void {
    this.step(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'ArrowLeft') this.previous();
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null) return;
    const dx = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;
    if (dx < 0) this.next();
    else this.previous();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  private step(delta: number): void {
    const total = this.images().length;
    this.viewerIndex.update((i) => (i === null ? i : (i + delta + total) % total));
  }
}
