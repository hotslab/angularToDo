import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <nav class="navbar navbar-expand-lg bg-black">
    <div class="container-fluid">
      <a routerLink="" routerLinkActive="" ariaCurrentWhenActive="page" class="navbar-brand">
        <img src="assets/images/continental.png" width="80" height="40" priority>
      </a>
      <button class="navbar-toggler border border-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list text-light"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <a  routerLink="" routerLinkActive="" ariaCurrentWhenActive="page" class="navbar-brand text-light fs-6">The Continental</a>
          <a  routerLink="/login" routerLinkActive="" ariaCurrentWhenActive="page" class="navbar-brand text-light fs-6">Login</a>
          <a  routerLink="/register" routerLinkActive="" ariaCurrentWhenActive="page" class="navbar-brand text-light fs-6">Register</a>
          <a  routerLink="/todo" routerLinkActive="" ariaCurrentWhenActive="page" class="navbar-brand text-light fs-6">To Dos</a>
          <a  routerLink="/user" routerLinkActive="" ariaCurrentWhenActive="page" class="navbar-brand text-light fs-6">Profile</a>
        </div>
      </div>
    </div>
  </nav>
  <div class="min-vh-100 container-fluid">
    <router-outlet></router-outlet>
  </div>
  <div class="bg-black h-100">
    <p>Tested</p>
</div>
  `,
  styles: [``]
})
export class AppComponent {
  title = 'frontend';
}
