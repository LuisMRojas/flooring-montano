import { Injectable, signal } from '@angular/core';

/**
 * Remembers which product or service a "Get a quote" button was pressed for,
 * so the quote form (card 19) can preselect it.
 */
@Injectable({ providedIn: 'root' })
export class QuoteIntentService {
  readonly preselected = signal<string | null>(null);

  select(id: string | null | undefined): void {
    if (id) this.preselected.set(id);
  }
}
