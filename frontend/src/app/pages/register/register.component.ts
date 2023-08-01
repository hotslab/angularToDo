import { Component } from '@angular/core';
import { ApiService } from '../../services/api';
import { Store } from '@ngrx/store';
import { register } from '../../state/actions/user.actions';
import { Router } from '@angular/router';

type RegisterCredentials = {
  email: string | null
  name: string | null
  surname: string | null
  password: string | null
}

@Component({
  selector: 'app-login',
  template: `
  <div class="container-fluid m-0 d-flex flex-column justify-content-start align-items-center pt-4 pb-5">
    <div class="text-center" style="width: 40%">
        <img 
          class="bg-black pb-4 px-3 mb-3 rounded-pill shadow" 
          src="assets/images/continental.png" width="150" height="75" priority
        >
        <div class="text-bg-dark p-3 fs-6 fw-bolder">Register</div>
    </div>
    <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="mt-5" style="width: 40%">
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
        <label for="name">Name</label>
        <input 
          type="text" 
          class="form-control"
          id="name"
          required
          [(ngModel)]="credentials.name" name="name"
          #name="ngModel"
        >
        <div *ngIf="name.invalid && (name.dirty || name.touched)" class="alert alert-danger fs-6 mb-3">
          <div *ngIf="name.errors?.['required']">
            Name is required.
          </div>
        </div>
      </div>
      <div class="form-group mb-3">
        <label for="surname">Surname</label>
        <input 
          type="text" 
          class="form-control"
          id="surname"
          required
          [(ngModel)]="credentials.surname" name="surname"
          #surname="ngModel"
        >
        <div *ngIf="surname.invalid && (surname.dirty || surname.touched)" class="alert alert-danger fs-6 mb-3">
          <div *ngIf="surname.errors?.['required']">
            Surname is required.
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
        <button type="button" class="btn btn-danger" (click)="reset(); registerForm.reset()">Reset</button>
        <button type="submit" class="btn btn-success" [disabled]="!registerForm.form.valid || loading">Submit</button>
      </div>
    </form>
  </div>
  `,
})
export class RegisterComponent {
  constructor(
    private http: ApiService,
    private readonly store: Store,
    private router: Router
  ) { }

  loading: boolean = false
  credentials: RegisterCredentials = { email: null, name: null, surname: null, password: null }

  reset() {
    this.credentials = { email: null, name: null, surname: null, password: null }
  }
  onSubmit() {
    this.loading = true
    this.http.postRequest({ url: 'register', body: this.credentials }).subscribe({
      next: (response: any) => {
        this.store.dispatch(register({ user: response.user, token: response.token }))
        this.router.navigate(['/todos'])
        this.loading = false
      },
      error: (error: any) => {
        console.log('Error', error.message)
        this.loading = false
      }
    })
  }
}
