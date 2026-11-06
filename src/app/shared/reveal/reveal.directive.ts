import { DOCUMENT, Directive, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

/**
 * Fades an element up the first time it scrolls into view.
 *
 *   <h2 appReveal>…</h2>
 *   <li appReveal [revealDelay]="$index * 80">…</li>
 *
 * The hidden state is only applied in the browser, after the first render,
 * so content is never hidden in prerendered HTML, without JavaScript or when
 * the user prefers reduced motion.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[class.reveal]': 'armed()',
    '[class.is-visible]': 'visible()',
    '[style.--reveal-delay.ms]': 'revealDelay()',
  },
})
export class Reveal {
  readonly revealDelay = input(0);

  protected readonly armed = signal(false);
  protected readonly visible = signal(false);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const win = inject(DOCUMENT).defaultView;

    afterNextRender(() => {
      if (!win || typeof IntersectionObserver === 'undefined') return;
      if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Already on screen at load (e.g. above the fold): leave it alone.
      const rect = el.getBoundingClientRect();
      if (rect.top < win.innerHeight && rect.bottom > 0) return;

      this.armed.set(true);
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.visible.set(true);
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(el);
    });
  }
}
