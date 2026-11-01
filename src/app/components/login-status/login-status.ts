import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
//import { OktaAuthService } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-status',
  imports: [CommonModule, RouterLink,],
  templateUrl: './login-status.html',
  styleUrl: './login-status.css',
})
export class LoginStatus implements OnInit {

  isAuthenticated: boolean = false;
  userFullName: string = '';
  userEmail: string = '';

  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  ngOnInit(): void {

    // Subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!;
        this.getUserDetails();
      }
    ) 
  }

  getUserDetails() {
    if (this.isAuthenticated) {

      //Fetch the logged in user details (user's claims)
      //
      // user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (res) =>{
          this.userFullName = res.name as string;

          const theEmail = res.email as string | undefined;

          if (theEmail) {
            this.userEmail = theEmail;
            this.storage.setItem('userEmail', JSON.stringify(theEmail));
          }
        }
      );
    } else {
      this.userFullName = '';
      this.userEmail = '';
      this.storage.removeItem('userEmail');
    }
  }

  logout(){
    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }
}
