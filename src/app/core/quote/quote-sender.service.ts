import { Injectable, InjectionToken, inject } from '@angular/core';
import { Lang } from '../models/content.models';

/** What the form sends. */
export interface QuoteRequest {
  name: string;
  phone: string;
  zip: string;
  /** Product or service id, or "not-sure". */
  flooringType: string;
  email?: string;
  sqft?: number;
  preferredDate?: string;
  preferredTime?: string;
  comments?: string;
  inServiceArea: boolean;
  language: Lang;
}

export interface QuoteResult {
  /** True when nothing was really sent (no endpoint configured). */
  demo: boolean;
}

/**
 * Where quote requests are POSTed as JSON (e.g. a Formspree or Netlify form
 * endpoint, chosen when publishing in card 24). null = demo mode: the form
 * works and confirms, but nothing leaves the browser.
 */
export const QUOTE_ENDPOINT = new InjectionToken<string | null>('QUOTE_ENDPOINT', {
  factory: () => null,
});

@Injectable({ providedIn: 'root' })
export class QuoteSender {
  private readonly endpoint = inject(QUOTE_ENDPOINT);

  async send(request: QuoteRequest): Promise<QuoteResult> {
    if (!this.endpoint) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { demo: true };
    }
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Quote request failed: ${response.status}`);
    return { demo: false };
  }
}
