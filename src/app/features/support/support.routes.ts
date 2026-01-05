import { Routes } from '@angular/router';

export const supportRoutes: Routes = [
  {
    path: 'callcenter',
    loadComponent: () => import('./pages/call-center/call-center').then((m) => m.CallCenterComponent),
  },
  {
    path: 'contactos',
    loadComponent: () => import('./pages/contacts/contacts').then((m) => m.ContactsComponent),
  },
];
