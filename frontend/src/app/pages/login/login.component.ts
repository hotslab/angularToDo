import { Component } from '@angular/core';
import { ApiService } from '../../services/api';
import { Store } from '@ngrx/store';
import { login } from '../../state/actions/user.actions';
import { Router } from '@angular/router';

type LoginCredentials = {
  email: string | null
  password: string | null
}

@Component({
  selector: 'app-login',
  template: `
  <div class="container-fluid m-0 d-flex flex-column justify-content-center align-items-center pt-4 pb-5">
    <div class="text-center" style="width: 40%">
        <img 
          class="mb-3 shadow" 
          src="assets/images/logo.png" width="100" height="100" priority
        >
        <div class="text-light bg-black rounded p-3 fs-6 fw-bolder">LOGIN</div>
    </div>
    <div class="card mt-5 p-4" style="width: 40%">
      <div class="card-content">
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group mb-3">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              class="form-control"
              id="email" 
              required
              email
              [(ngModel)]="credentials.email" name="email"
              #email="ngModel"
            >
            <div *ngIf="email.invalid && (email.dirty || email.touched)" class="alert alert-danger fs-6 mb-3">
              <div *ngIf="email.errors?.['required']">
                Email is required.
              </div>
              <div *ngIf="email.errors?.['email']">
                Email is in incorrect format
              </div>
            </div>
          </div>
          <div class="form-group mb-3">
            <label for="password">Password</label>
            <input 
              type="password" 
              class="form-control"
              id="password"
              required
              [(ngModel)]="credentials.password" name="password"
              #password="ngModel"
            >
            <div *ngIf="password.invalid && (password.dirty || password.touched)" class="alert alert-danger fs-6 mb-3">
              <div *ngIf="password.errors?.['required']">
                Password is required.
              </div>
            </div>
          </div>
          <div class="mt-3 d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-danger" (click)="reset(); loginForm.reset()">Reset</button>
            <button type="submit" class="btn btn-success" [disabled]="!loginForm.form.valid || loading">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <app-modal *ngIf="errorMessage">
    <div class="modal-header">
      <h5 class="modal-title text-danger">Error</h5>
      <button (click)="errorMessage = null" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <p>{{ errorMessage }}</p>
    </div>
    <div class="modal-footer">
      <button (click)="errorMessage = null" type="button" class="btn btn-danger">Close</button>
    </div>
  </app-modal>
  <app-spinner *ngIf="loading" />
  `,
})
export class LoginComponent {
  constructor(
    private http: ApiService,
    private readonly store: Store,
    private router: Router
  ) { }

  loading: boolean = false
  errorMessage: string | null = null
  credentials: LoginCredentials = { email: 'john.wick@continental.com', password: 'boogeyman' }

  reset() {
    this.credentials = { email: null, password: null }
  }
  onSubmit() {
    this.loading = true
    this.http.postRequest({ url: 'login', body: this.credentials }).subscribe({
      next: (response: any) => {
        this.store.dispatch(login({ user: response.user, token: response.token }))
        this.router.navigate(['/todos'])
        this.loading = false
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
}
