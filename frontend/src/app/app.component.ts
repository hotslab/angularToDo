import { selectUser, selectUserData, selectUserToken } from './state/index';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, UrlSegment } from '@angular/router';
import { Store } from '@ngrx/store';
import { Token, User } from './types/index';
import { logout } from './state/actions/user.actions';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
  <nav class="navbar navbar-expand-lg bg-black">
    <div class="container-fluid">
      <a routerLink="" class="navbar-brand">
        <img src="assets/images/continental.png" width="80" height="40" priority>
      </a>
      <button class="navbar-toggler border border-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list text-light"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <a  
            routerLink="" 
            [ngClass]="{'bg-dark': currentUrl === '/', 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
          >
            Home
          </a>
          <a  routerLink="/users" 
            *ngIf="user && user.role === 'admin' && tokenData?.token" 
            [ngClass]="{'bg-dark': currentUrl === '/users', 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
          >
            Users
          </a>
          <a  
            (click)="goTo('todos')" *ngIf="user && tokenData?.token"   
            [ngClass]="{'bg-dark': currentUrl === ('/todos/'+user.id), 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
          >
            ToDos
          </a>
          <a  
            (click)="goTo('profile')" 
            *ngIf="user && tokenData?.token" 
            [ngClass]="{'bg-dark': currentUrl === ('/users/'+user.id), 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
          >
            Profile
          </a>
          <a  
            routerLink="/login" 
            *ngIf="!user" 
            [ngClass]="{'bg-dark': currentUrl === '/login', 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
          >
            Login
          </a>
          <a  
            routerLink="/register" 
            *ngIf="!user" 
            [ngClass]="{'bg-dark': currentUrl === '/register', 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
          >
            Register
          </a>
          <a  
            (click)="logOut()" 
            *ngIf="user && tokenData?.token" 
            [ngClass]="{'bg-dark': false, 'navbar-brand px-3 mx-0 text-light fs-6':true,}"
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
    private activatedRoute: ActivatedRoute
  ) {
  }

  currentUrl: string | null = null
  user: User | null = null
  tokenData: Token | null = null
  today: number = Date.now()

  goTo(route: string) {
    if (this.user) this.router.navigate([`/${route}`, this.user.id])
  }

  logOut() {
    this.store.dispatch(logout())
    localStorage.clear()
    if (this.user) this.router.navigate(['/'])
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

