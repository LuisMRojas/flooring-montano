import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { Icon } from '../../../shared/ui/icon/icon';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';
import { QuoteForm } from '../quote-form/quote-form';

/**
 * #contact: where every quote button lands. Call/text, service area, hours,
 * and the quote form (card 19).
 */
@Component({
  selector: 'app-contact-section',
  imports: [TranslatePipe, Reveal, Icon, SectionHeader, QuoteForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('contact')!;
    @let c = content.contact();
    <section id="contact" class="page-section page-section--dark" aria-labelledby="contact-title">
      <!-- Phones: title, form, call/text, area and hours. Desktop: info left, form right. -->
      <div class="container contact">
        <app-section-header class="contact__head" titleId="contact-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" [inverse]="true" />

        <!-- No reveal animation: quote buttons land here and the form must be ready at once -->
        <div class="contact__form">
          <!-- Form code (Angular forms) loads only near the section, prefetched when idle -->
          @defer (on viewport; prefetch on idle) {
            <app-quote-form />
          } @placeholder {
            <div class="form-placeholder" aria-hidden="true"></div>
          }
        </div>

        <div class="contact__actions" appReveal>
          <a class="btn btn--light btn--lg" [href]="'tel:' + c.phoneE164">
            <app-icon name="phone" />
            {{ 'contact.callUs' | translate }} · {{ c.phoneDisplay }}
          </a>
          <a class="btn btn--outline-light btn--lg" [href]="'sms:' + c.phoneE164">{{ 'contact.textUs' | translate }}</a>
        </div>

        <div class="contact__details" appReveal [revealDelay]="120">
          <div>
            <h3>{{ 'contact.area' | translate }}</h3>
            <p>{{ i18n.t(c.serviceArea) }}</p>
            <ul class="cities">
              @for (city of c.nearbyCities; track city) {
                <li>{{ city }}</li>
              }
            </ul>
          </div>
          <div>
            <h3>{{ 'contact.hours' | translate }}</h3>
            <dl class="hours">
              @for (h of c.hours; track $index) {
                <div>
                  <dt>{{ i18n.t(h.days) }}</dt>
                  <dd>{{ i18n.t(h.time) }}</dd>
                </div>
              }
            </dl>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
}
