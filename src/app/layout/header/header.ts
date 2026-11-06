import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ViewportScroller } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { LogoMark } from '../../shared/logo-mark/logo-mark';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, RouterLink, LogoMark],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
    '(window:scroll)': 'onScroll()',
    '[class.is-solid]': 'solid()',
  },
})
export class Header {
  protected readonly i18n = inject(LanguageService);
  private readonly content = inject(ContentService);
  protected readonly spy = inject(ScrollSpyService);
  private readonly document = inject(DOCUMENT);

  protected readonly brand = this.content.brand;
  protected readonly contact = this.content.contact;
  protected readonly navItems = this.content.navItems;

  protected readonly menuOpen = signal(false);
  /** Transparent over the hero at the top of the page, solid navy once scrolled or with the menu open. */
  private readonly scrolled = signal(false);
  protected readonly solid = computed(() => this.scrolled() || this.menuOpen());
  protected readonly langCode = computed(() => (this.i18n.lang() === 'en' ? 'es' : 'en'));

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileMenu = viewChild.required<ElementRef<HTMLElement>>('mobileMenu');

  constructor() {
    // Router anchor scrolling ignores CSS scroll-margin-top, so offset it by the fixed header.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    inject(ViewportScroller).setOffset(() => [0, host.offsetHeight]);

    afterNextRender(() => this.onScroll());

    effect(() => {
      const open = this.menuOpen();
      this.document.body.classList.toggle('no-scroll', open);
      if (open) {
        queueMicrotask(() => this.mobileMenu().nativeElement.querySelector<HTMLElement>('a')?.focus());
      }
    });
  }

  protected onScroll(): void {
    const y = this.document.defaultView?.scrollY ?? 0;
    this.scrolled.set(y > 24);
  }

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu(true);
    } else {
      this.menuOpen.set(true);
    }
  }

  protected closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (returnFocus) this.menuButton().nativeElement.focus();
  }
}
