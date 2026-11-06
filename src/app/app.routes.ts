import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

// Single-page site: every menu item is a fragment of the home route.
export const routes: Routes = [
  // Title and description come from SeoService (they follow the language).
  { path: '', component: Home },
  { path: '**', redirectTo: '' },
];
