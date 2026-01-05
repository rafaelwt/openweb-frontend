import { Routes } from '@angular/router';

export const businessRoutes: Routes = [
  {
    // Proximamente page for R/P services (must be before dynamic route)
    path: ':aliasServicio/proximamente',
    loadComponent: () => import('./pages/proximamente-page/proximamente-page').then((m) => m.ProximamentePageComponent),
  },
  {
    // Dynamic route for all cobranza services
    path: ':aliasServicio',
    loadComponent: () => import('./pages/cobranza-wizard/cobranza-wizard').then((m) => m.CobranzaWizardComponent),
  },
];
