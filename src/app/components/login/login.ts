import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import myAppConfig from '../../config/my-app-config';
import OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {

  oktaSignin: any;

  constructor(
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
    private router: Router
  ) {

    this.oktaSignin = new OktaSignIn({
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUrl,

      authParams: {
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes,
        pkce: true
      }
    });
  }

  ngOnInit(): void {

    console.log('LOGIN COMPONENT LOADED');

    // If already logged in, go to products
    if (this.oktaAuth.authStateManager.getAuthState()?.isAuthenticated) {
      this.router.navigate(['/products']);
      return;
    }

    // Show Okta Sign-In Widget
    this.oktaSignin.showSignInToGetTokens({
      el: '#okta-sign-in-widget',
      scopes: myAppConfig.oidc.scopes
    })
    .then((tokens: any) => {

      console.log('OKTA LOGIN SUCCESS');

      // Remove the widget
      this.oktaSignin.remove();

      // Handle the tokens
      this.oktaAuth.handleLoginRedirect(tokens)
        .then(() => {

          console.log('OKTA TOKEN HANDLING SUCCESS');

          this.router.navigate(['/products']);

        })
        .catch((error: any) => {

          console.error('OKTA TOKEN ERROR:', error);

        });

    })
    .catch((error: any) => {

      console.error('OKTA LOGIN ERROR:', error);

    });
  }

  ngOnDestroy(): void {

    console.log('LOGIN COMPONENT DESTROYED');

    // Clean up the widget
    this.oktaSignin.remove();
  }
}

