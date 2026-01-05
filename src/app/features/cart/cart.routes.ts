import { Routes } from '@angular/router';

export const cartRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/checkout-wizard/checkout-wizard').then((m) => m.CheckoutWizardComponent),
  },
];
