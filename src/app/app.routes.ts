import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

// Single-page site: every menu item is a fragment of this one route.
export const routes: Routes = [
  { path: '', component: Home, title: 'Flooring in Dearborn, MI | Montano Flooring' },
  { path: '**', redirectTo: '' },
];
