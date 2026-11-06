import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { Icon } from '../../../shared/ui/icon/icon';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/** #why-us (dark): 4 reasons, sample figures and the financing strip (mid-page CTA). */
@Component({
  selector: 'app-why-us-section',
  imports: [Reveal, CtaButton, Icon, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('why-us')!;
    @let why = content.home().whyUs;
    <section id="why-us" class="page-section page-section--dark" aria-labelledby="why-us-title">
      <div class="container">
        <app-section-header titleId="why-us-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" [inverse]="true" />

        <ul class="points">
          @for (p of why.points; track $index) {
            <li appReveal [revealDelay]="$index * 90">
              <span class="points__icon"><app-icon [name]="p.icon" /></span>
              <h3>{{ i18n.t(p.title) }}</h3>
              <p>{{ i18n.t(p.text) }}</p>
            </li>
          }
        </ul>

        <div class="stats" appReveal>
          <dl>
            @for (st of why.stats; track $index) {
              <div>
                <dt>{{ i18n.t(st.label) }}</dt>
                <dd>{{ st.value }}</dd>
              </div>
            }
          </dl>
          <p class="stats__note">{{ i18n.t(why.statsNote) }}</p>
        </div>

        <div class="cta-strip cta-strip--light" appReveal>
          <p>{{ i18n.t(why.financing.text) }}</p>
          <app-cta [cta]="why.financing.cta" variant="primary" [arrow]="true" />
        </div>
      </div>
    </section>
  `,
  styleUrl: './why-us-section.scss',
})
export class WhyUsSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
}
