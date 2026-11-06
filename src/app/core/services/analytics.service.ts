import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContentService } from './content.service';

interface GoatCounter {
  count(vars: { path: string; title?: string; event?: boolean }): void;
}

/**
 * Basic, privacy-friendly analytics (card 24) with GoatCounter: no cookies,
 * no personal data, so no consent banner is needed. Off until
 * `integrations.goatcounterCode` is set in src/content/site.json.
 *
 * Besides page views it counts two events that matter for the business:
 * quote requests sent and taps on a "Call" link.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly content = inject(ContentService);

  /** Call once at startup. */
  init(): void {
    const code = this.content.integrations().goatcounterCode;
    if (!this.isBrowser || !code) return;

    const script = this.document.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.dataset['goatcounter'] = `https://${code}.goatcounter.com/count`;
    this.document.body.appendChild(script);

    this.document.addEventListener('click', (e) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (link) this.event('call-click', 'Tapped Call');
    });
  }

  event(path: string, title: string): void {
    const gc = (this.document.defaultView as (Window & { goatcounter?: GoatCounter }) | null)?.goatcounter;
    gc?.count?.({ path, title, event: true });
  }
}
