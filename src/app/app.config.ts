import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideOktaAuth, withOktaConfig } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import myAppConfig from './config/my-app-config';

import { AuthInterceptor } from './services/auth-interceptor';

const oktaAuth = new OktaAuth({
  issuer: myAppConfig.oidc.issuer,
  clientId: myAppConfig.oidc.clientId,
  redirectUri: myAppConfig.oidc.redirectUrl,
  scopes: myAppConfig.oidc.scopes
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    provideOktaAuth(
      withOktaConfig({ oktaAuth })
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
