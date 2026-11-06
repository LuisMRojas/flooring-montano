import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Small "M" mark for the header, drawn from the Montano Flooring logo
 * (white M with three wood-tone planks). The full round logo is unreadable
 * at 40 px, so it is used in larger places (footer, About) instead.
 */
@Component({
  selector: 'app-logo-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 40" aria-hidden="true" focusable="false">
      <path fill="#fff" d="M0 0h9l15 20L39 0h9v40h-8V14L28 30h-8L8 14v26H0z" />
      <rect x="11" y="24" width="4" height="16" fill="#6b3a1e" />
      <rect x="16" y="28" width="4" height="12" fill="#a66e38" />
      <rect x="21" y="32" width="4" height="8" fill="#d9a877" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    svg {
      width: 2.25rem;
      height: auto;
    }
  `,
})
export class LogoMark {}
