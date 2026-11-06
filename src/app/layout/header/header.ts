import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND, CONTACT, SECTIONS, UI } from '../../core/data/site.data';
import { LanguageService } from '../../core/services/language.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { LogoMark } from '../../shared/logo-mark/logo-mark';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LogoMark],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
  },
})
export class Header {
  protected readonly i18n = inject(LanguageService);
  protected readonly spy = inject(ScrollSpyService);
  private readonly document = inject(DOCUMENT);

  protected readonly brand = BRAND;
  protected readonly contact = CONTACT;
  protected readonly ui = UI;
  protected readonly navItems = SECTIONS.filter((s) => s.inNav).sort((a, b) => a.order - b.order);

  protected readonly menuOpen = signal(false);
  protected readonly langLabel = computed(() => (this.i18n.lang() === 'en' ? 'Español' : 'English'));
  protected readonly langCode = computed(() => (this.i18n.lang() === 'en' ? 'es' : 'en'));

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileMenu = viewChild.required<ElementRef<HTMLElement>>('mobileMenu');

  constructor() {
    effect(() => {
      const open = this.menuOpen();
      this.document.body.classList.toggle('no-scroll', open);
      if (open) {
        queueMicrotask(() => this.mobileMenu().nativeElement.querySelector<HTMLElement>('a')?.focus());
      }
    });
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
