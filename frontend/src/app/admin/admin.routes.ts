import { Routes } from '@angular/router';
import { adminGuard, loginGuard } from '../core/auth.http';

/** Lazy /admin area (its own chunks; never downloaded by normal visitors). */
export const ADMIN_ROUTES: Routes = [
  { path: 'login', canActivate: [loginGuard], data: { seo: 'admin' }, loadComponent: () => import('./login').then(m => m.AdminLogin) },
  {
    path: '', canActivate: [adminGuard], data: { seo: 'admin' },
    loadComponent: () => import('./admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', data: { seo: 'admin' }, loadComponent: () => import('./admin-home').then(m => m.AdminHome) },
      { path: 'bookings', data: { seo: 'admin' }, loadComponent: () => import('./admin-bookings').then(m => m.AdminBookings) },
      { path: 'slots', data: { seo: 'admin' }, loadComponent: () => import('./admin-slots').then(m => m.AdminSlots) },
      { path: 'products', data: { seo: 'admin' }, loadComponent: () => import('./admin-products').then(m => m.AdminProducts) },
      { path: 'categories', data: { seo: 'admin' }, loadComponent: () => import('./admin-categories').then(m => m.AdminCategories) },
      { path: 'offers', data: { seo: 'admin' }, loadComponent: () => import('./admin-offers').then(m => m.AdminOffers) },
      { path: 'reviews', data: { seo: 'admin' }, loadComponent: () => import('./admin-reviews').then(m => m.AdminReviews) },
      { path: 'gallery', data: { seo: 'admin' }, loadComponent: () => import('./admin-gallery').then(m => m.AdminGallery) },
      { path: '**', redirectTo: '' },
    ],
  },
];
