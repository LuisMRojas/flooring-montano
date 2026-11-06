import { TranslatePipe } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';
import { BottomBar } from './layout/bottom-bar/bottom-bar';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  imports: [TranslatePipe, RouterOutlet, Header, Footer, BottomBar],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Created at startup so the saved language is applied before the first paint.
  private readonly i18n = inject(LanguageService);

  constructor() {
    inject(SeoService).init();
    inject(AnalyticsService).init();
  }
}
