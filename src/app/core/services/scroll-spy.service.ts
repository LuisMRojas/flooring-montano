import { DOCUMENT, DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Tracks which page section is in view so the menu can highlight it.
 * A section counts as active when it crosses a band in the middle of the screen.
 */
@Injectable({ providedIn: 'root' })
export class ScrollSpyService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer?: IntersectionObserver;

  readonly activeId = signal<string>('home');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  observe(ids: string[]): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') return;
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.activeId.set(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const el = this.document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }
}
