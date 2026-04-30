import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'get-started',
    loadComponent: () =>
      import('./pages/get-started/get-started-page').then(
        (m) => m.GetStartedPage,
      ),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/user-home/user-home-page').then((m) => m.UserHomePage),
  },
];
