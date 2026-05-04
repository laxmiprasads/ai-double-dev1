import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'get-started',
    renderMode: RenderMode.Client,
  },
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        { slug: 'kushi-restaurant' },
        { slug: 'styleco-barbershop' },
        { slug: 'everybody-pt' },
      ];
    },
  },
];
