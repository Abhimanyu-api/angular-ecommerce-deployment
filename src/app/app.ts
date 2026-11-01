import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductCategoryMenu } from './components/product-category-menu/product-category-menu';
import { Search } from './components/search/search';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { CartStatus } from "./components/cart-status/cart-status";
import { ReactiveFormsModule } from '@angular/forms';
import { LoginStatus } from './components/login-status/login-status';
import { ProductService } from './services/product';
import { OKTA_CONFIG } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth-interceptor';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, ProductCategoryMenu, Search, NgbModule, CartStatus, ReactiveFormsModule, LoginStatus],
  providers: [ProductService, { provide: OKTA_CONFIG, useValue: {  OktaAuth}},
              {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],           
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-ecommerce');
}
