import { Injector } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { canActivateAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

import { ProductList } from './components/product-list/product-list';
import { ProductDetails } from './components/product-details/product-details';
import { CartDetails } from './components/cart-details/cart-details';
import { Checkout } from './components/checkout/checkout';
import { Login } from './components/login/login';
import { MembersPage } from './components/members-page/members-page';
import { OrderHistory } from './components/order-history/order-history';

function sendToLoginPage(_oktaAuth: OktaAuth, injector: Injector) {
  const router = injector.get(Router);
  router.navigate(['/login']);
}

export const routes: Routes = [
{path: 'order-history', component: OrderHistory,
         canActivate: [canActivateAuthGuard],
    data: { onAuthRequired: sendToLoginPage }},
  {path: 'members',
    component: MembersPage,
    canActivate: [canActivateAuthGuard],
    data: { onAuthRequired: sendToLoginPage }},
  { path: 'login/callback', component: OktaCallbackComponent, pathMatch: 'full' },
  { path: 'login', component: Login, pathMatch: 'full' },
  { path: 'checkout', component: Checkout },
  { path: 'cart-details', component: CartDetails },
  { path: 'products/:id', component: ProductDetails },
  { path: 'search/:keyword', component: ProductList },
  { path: 'category/:id', component: ProductList },
  { path: 'category', component: ProductList },
  { path: 'products', component: ProductList },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' }
];
