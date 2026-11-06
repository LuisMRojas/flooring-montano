import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { Reveal } from '../../../shared/reveal/reveal.directive';
import { Gallery } from '../../../shared/ui/gallery/gallery';
import { SectionHeader } from '../../../shared/ui/section-header/section-header';

/** #gallery: swipe strip on phones, grid on larger screens, full-screen viewer. */
@Component({
  selector: 'app-gallery-section',
  imports: [Reveal, Gallery, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = content.section('gallery')!;
    <section id="gallery" class="page-section" aria-labelledby="gallery-title">
      <div class="container">
        <app-section-header titleId="gallery-title" [kicker]="kicker()" [title]="s.title ?? s.label" [intro]="s.intro" />
        <app-gallery [images]="content.gallery()" appReveal />
      </div>
    </section>
  `,
})
export class GallerySection {
  protected readonly content = inject(ContentService);
  readonly kicker = input<string>();
}
