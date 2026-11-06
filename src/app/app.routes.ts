import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

// Single-page site: every menu item is a fragment of the home route.
export const routes: Routes = [
  { path: '', component: Home, title: 'Flooring in Dearborn, MI | Montano Flooring' },
  // Internal component showcase (card 16), not linked and noindex. Remove before launch.
  {
    path: 'ui',
    loadComponent: () => import('./pages/ui-showcase/ui-showcase').then((m) => m.UiShowcase),
    title: 'Components | Montano Flooring',
  },
  { path: '**', redirectTo: '' },
];
