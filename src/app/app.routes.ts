import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { NotFoundPageComponent } from './features/errors/pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
      },
      {
        path: 'servicio',
        loadChildren: () => import('./features/business/business.routes').then((m) => m.businessRoutes),
      },
      {
        path: 'soporte',
        loadChildren: () => import('./features/support/support.routes').then((m) => m.supportRoutes),
      },
      {
        path: 'carrito',
        loadChildren: () => import('./features/cart/cart.routes').then((m) => m.cartRoutes),
      },
      {
        path: '**',
        component: NotFoundPageComponent,
      },
    ],
  },
];
