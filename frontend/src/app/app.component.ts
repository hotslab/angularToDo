import { selectUserData, selectUserToken } from './state/index';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Token, User } from './types/index';
import { logout } from './state/actions/user.actions';

@Component({
  selector: 'app-root',
  template: `
  <nav class="navbar navbar-expand-sm bg-black">
    <div class="container-fluid">
      <a routerLink="" class="navbar-brand">
        <img src="assets/images/logo.png" width="40" height="40" priority>
      </a>
      <button class="navbar-toggler border border-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list text-light"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <a  
            routerLink="" 
            [ngClass]="{'bg-dark': currentUrl === '/', 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            Home
          </a>
          <a  
            routerLink="/users" 
            *ngIf="user && user.role === 'admin' && tokenData?.token" 
            [ngClass]="{'bg-dark': currentUrl === '/users', 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            Users
          </a>
          <a
            routerLink="/todos" 
            *ngIf="user && tokenData?.token"   
            [ngClass]="{'bg-dark': currentUrl === '/todos', 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            ToDos
          </a>
          <a
            [routerLink]="['/user']" 
            [queryParams]="{id: user.id}"
            *ngIf="user && tokenData?.token" 
            [ngClass]="{'bg-dark': currentUrl === ('/users/'+user.id), 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            Profile
          </a>
          <a  
            routerLink="/login" 
            *ngIf="!user" 
            [ngClass]="{'bg-dark': currentUrl === '/login', 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            Login
          </a>
          <a  
            routerLink="/register" 
            *ngIf="!user" 
            [ngClass]="{'bg-dark': currentUrl === '/register', 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            Register
          </a>
          <a  
            (click)="logOut()" 
            *ngIf="user && tokenData?.token" 
            [ngClass]="{'bg-dark': false, 'navbar-brand px-3 mx-0 text-light fs-6 cursor-pointer':true,}"
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  </nav>
  <div class="min-vh-100 container-fluid p-0 m-0">
    <router-outlet></router-outlet>
  </div>
  <footer class="bg-black h-100 px-3 py-4 text-light text-center d-flex flex-column justify-center align-items-center">
    <span class="mb-3">The Continental <i class="bi bi-c-circle"></i> {{ today | date: 'yyyy' }}</span>
    <span class="fs-6">All rights held by the High Table</span>
  </footer>
  `,
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private readonly store: Store,
  ) {
  }

  currentUrl: string | null = null
  user: User | null = null
  tokenData: Token | null = null
  today: number = Date.now()

  logOut() {
    this.store.dispatch(logout())
    localStorage.clear()
    this.router.navigate(['/'])
  }

  ngOnInit(): void {
    this.router.events.subscribe({
      next: event => {
        if (event instanceof NavigationEnd) this.currentUrl = event.urlAfterRedirects
      }
    })
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.user = user } })
    this.store.select(selectUserToken).subscribe({ next: (token: Token | null) => this.tokenData = token })
  }
}

