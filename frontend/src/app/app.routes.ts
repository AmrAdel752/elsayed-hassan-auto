import { Routes } from '@angular/router';

// `data.seo` picks the page title/description from meta.pages in the dictionaries.
// Every page (home included) is lazy so the first download stays small.
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'services', data: { seo: 'services' }, loadComponent: () => import('./pages/services/services').then(m => m.Services) },
  { path: 'services/:slug', data: { seo: 'services' }, loadComponent: () => import('./pages/services/service-details').then(m => m.ServiceDetails) },
  { path: 'book', data: { seo: 'book' }, loadComponent: () => import('./pages/book/book').then(m => m.Book) },
  { path: 'products', data: { seo: 'products' }, loadComponent: () => import('./pages/products/products').then(m => m.Products) },
  { path: 'products/:slug', data: { seo: 'products' }, loadComponent: () => import('./pages/products/product-details').then(m => m.ProductDetails) },
  { path: 'models', data: { seo: 'models' }, loadComponent: () => import('./pages/models/models').then(m => m.Models) },
  { path: 'models/:slug', data: { seo: 'models' }, loadComponent: () => import('./pages/models/model-details').then(m => m.ModelDetails) },
  { path: 'tips', data: { seo: 'tips' }, loadComponent: () => import('./pages/tips/tips').then(m => m.Tips) },
  { path: 'tips/:slug', data: { seo: 'tips' }, loadComponent: () => import('./pages/tips/tip-details').then(m => m.TipDetails) },
  { path: 'gallery', data: { seo: 'gallery' }, loadComponent: () => import('./pages/gallery/gallery').then(m => m.Gallery) },
  { path: 'reviews', data: { seo: 'reviews' }, loadComponent: () => import('./pages/reviews/reviews').then(m => m.Reviews) },
  { path: 'faq', data: { seo: 'faq' }, loadComponent: () => import('./pages/faq/faq').then(m => m.Faq) },
  { path: 'estimate', data: { seo: 'estimate' }, loadComponent: () => import('./pages/estimate/estimate').then(m => m.Estimate) },
  { path: 'track', data: { seo: 'track' }, loadComponent: () => import('./pages/track/track').then(m => m.Track) },
  { path: 'maintenance-calculator', data: { seo: 'calc' }, loadComponent: () => import('./pages/calculator/calculator').then(m => m.Calculator) },
  { path: 'offers', data: { seo: 'offers' }, loadComponent: () => import('./pages/offers/offers').then(m => m.Offers) },
  { path: 'about', data: { seo: 'about' }, loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'contact', data: { seo: 'contact' }, loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: '**', data: { seo: 'notFound' }, loadComponent: () => import('./pages/not-found').then(m => m.NotFound) },
];
