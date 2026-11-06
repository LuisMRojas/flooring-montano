import { TranslatePipe } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';

/** Fixed bar at the bottom of phones and tablets: Call + Free Estimate (card 4). */
@Component({
  selector: 'app-bottom-bar',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bar" [attr.aria-label]="'a11y.quickActions' | translate">
      <a class="bar__btn bar__btn--call" [href]="'tel:' + contact().phoneE164">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
          />
        </svg>
        {{ 'actions.call' | translate }}
      </a>
      <a class="bar__btn bar__btn--estimate" routerLink="/" fragment="contact">
        {{ 'actions.freeEstimate' | translate }}
      </a>
    </nav>
  `,
  styleUrl: './bottom-bar.scss',
})
export class BottomBar {
  protected readonly i18n = inject(LanguageService);
  private readonly content = inject(ContentService);
  protected readonly contact = this.content.contact;
}
