import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Service } from '../../../core/models/content.models';
import { ContentService } from '../../../core/services/content.service';
import { LanguageService } from '../../../core/services/language.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { CtaButton } from '../../../shared/ui/cta-button/cta-button';
import { ProcessSteps } from '../../../shared/ui/process-steps/process-steps';
import { ServiceCard } from '../../../shared/ui/service-card/service-card';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/** #services: service cards, the installation process in 4 steps and the "shop at home" strip. */
@Component({
  selector: 'app-services-section',
  imports: [Reveal, CtaButton, ProcessSteps, ServiceCard, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('services')!;
    <section id="services" class="page-section page-section--surface" aria-labelledby="services-title">
      <div class="container">
        <app-section-header titleId="services-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" />
        <ul class="card-grid">
          @for (svc of content.services(); track svc.id; let i = $index) {
            <li appReveal [revealDelay]="(i % 3) * 90">
              <app-service-card [service]="svc" [index]="i" (details)="details.emit($event)" />
            </li>
          }
        </ul>

        @if (process(); as p) {
          <div class="process" appReveal>
            <h3>{{ i18n.t(p.name) }}</h3>
            <app-process-steps [steps]="p.steps" />
          </div>
        }

        <!-- "Shop at home" strip (card 3: it belongs to Services) -->
        @let shop = content.home().shopAtHome;
        <div class="cta-strip" appReveal>
          <p>{{ i18n.t(shop.text) }}</p>
          <app-cta [cta]="shop.cta" variant="light" [arrow]="true" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .process {
      margin-top: var(--space-12);
      padding: var(--space-8) var(--space-6);
      border-radius: calc(var(--radius) + 6px);
      background: var(--color-bg);
      box-shadow: var(--shadow-card);
    }
    h3 {
      margin-bottom: var(--space-6);
      font-size: 1.25rem;
      color: var(--color-primary);
    }
  `,
})
export class ServicesSection {
  protected readonly i18n = inject(LanguageService);
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
  readonly details = output<Service>();

  /** The service with the most steps (installation) is shown as the process block. */
  protected readonly process = computed(() =>
    [...this.content.services()].sort((a, b) => b.steps.length - a.steps.length)[0],
  );
}
