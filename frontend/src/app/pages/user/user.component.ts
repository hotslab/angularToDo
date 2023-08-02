import { Time, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api';
import { selectUserData } from 'src/app/state';
import { User } from 'src/app/types';

enum Roles {
  ADMIN = 'admin',
  USER = 'user'
}

@Component({
  selector: 'app-user',
  template: `
  <div class="container-fluid m-0 p-3 d-flex flex-column justify-content-center align-items-center">
    <div class="text-light bg-black d-flex justify-content-between align-items-center w-100 p-3 rounded flex-wrap">
      <h3>{{user ? user.name + ' ' +  user.surname : 'Create User' }}</h3>
      <div class="d-flex justify-content-end align-items-center">
        <a (click)="goBackOrCancel()" class="btn btn-sm btn-danger">{{ this.editing ? 'Cancel' : 'Back'}}</a>
        <a *ngIf="!editing" (click)="openEditing()" title="Edit ToDo" class="btn btn-sm btn-success ms-3">Edit</a>
      </div>
    </div>
    <div *ngIf="user && !editing" class="card mt-5 col-12 border" style="max-width: 800px; height: 300px;">
      <div class="row g-0">
        <div class="col-md-4 border border-secondary-subtle profile-image" style="background-image: url('../../assets/images/coin.jpg');">
        </div>
        <div class="col-md-8 border border-secondary-subtle">
          <div class="card-body">
            <h5 class="card-title">USER DETAILS</h5>
            <span class="card-text text-body-secondary mb-5" style="font-size: 15px;">Email</span>
            <p class="card-text">{{user.email}}</p>
            <span class="card-text text-body-secondary mb-5" style="font-size: 15px;">Registered on</span>
            <p class="card-text">{{user.created_at | date: 'yyyy-MM-dd HH:mm:ss'}}</p>
            <p class="card-text text-body-secondary" style="font-size: 15px;">
              Last updated on {{user.updated_at | date: 'yyyy-MM-dd HH:mm:ss'}}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="editing" class="container mt-5">
      <div class="row align-items-center justify-content-center">
        <div class="card col-12 col-sm-6">
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #userForm="ngForm">
              <div class="form-group mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  required
                  email
                  [(ngModel)]="editingUser.email" name="email"
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
                  [(ngModel)]="editingUser.name" name="name"
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
                  [(ngModel)]="editingUser.surname" name="surname"
                  #surname="ngModel"
                >
                <div *ngIf="surname.invalid && (surname.dirty || surname.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="surname.errors?.['required']">
                    Surname is required.
                  </div>
                </div>
              </div>
              <div class="form-group mb-3">
                <label for="role">Role</label>
                <select 
                  aria-label="Select roles"
                  class="form-select form-select" 
                  id="role"
                  required
                  [(ngModel)]="editingUser.role" 
                  name="role"
                  #role="ngModel"
                >
                  <option value="user" selected>User</option>
                  <option value="admin">Admin</option>
                </select>
                <div *ngIf="role.invalid && (role.dirty || role.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="role.errors?.['required']">
                    Role is required.
                  </div>
                </div>
              </div>
              <div class="form-group mb-3">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  class="form-control"
                  id="password"
                  [required]="user === null"
                  [(ngModel)]="editingUser.password" name="password"
                  #password="ngModel"
                >
                <div *ngIf="password.invalid && (password.dirty || password.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="password.errors?.['required']">
                    Password is required.
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="card-footer text-body-secondary d-flex justify-content-end align-items-center">
            <button *ngIf="!user" type="button" class="btn btn-danger" (click)="reset(); userForm.reset();">Reset</button>
            <button type="submit" class="btn btn-success ms-3" (click)="onSubmit()" [disabled]="!userForm.form.valid || loading">Submit</button>
          </div>
        </div>
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
  <app-spinner *ngIf="loading"/>
  `,
  styles: [`
  .profile-image
    height: 300px
    background-size: 100%
    background-size: cover 
    background-position: center
    background-repeat: no-repeat 
  `]
})

export class UserComponent implements OnInit {
  constructor(
    private http: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly store: Store,
  ) { }

  authUser: User | null = null
  user: any = null
  userId: string | null = null
  loading: boolean = false
  errorMessage: string | null = null
  selectedUser: any = null
  editing: boolean = false
  editingUser: {
    email: string | null
    name: string | null
    surname: string | null
    role: Roles,
    id: number | null,
    password?: null
  } = {
      email: null,
      name: null,
      surname: null,
      role: Roles.USER,
      id: null,
      password: null,
    }

  /** removes keys from one dimensional object only e.g. const a = {a: 1, b: 'test'} */
  removeKeyFromObject(object: any, keys: string[]) {
    return Object.entries(object).filter((a, i) => !keys.includes(a[0]), [])
      .reduce((a: any, [k, v]) => (a[k] = v, a), {})
  }
  reset() {
    this.editingUser = {
      email: null,
      name: null,
      surname: null,
      role: Roles.USER,
      id: null,
      password: null
    }
  }
  setValues() {
    this.editingUser.email = this.user.email
    this.editingUser.name = this.user.name
    this.editingUser.surname = this.user.surname
    this.editingUser.role = this.user.role
    this.editingUser.id = this.user.id
    this.editingUser.password = null
  }
  openEditing() {
    this.setValues()
    this.editing = true
  }
  onSubmit() {
    if (this.user) {
      if (!this.editingUser.password) this.editingUser = this.removeKeyFromObject(this.editingUser, ['password'])
      this.updateUser()
    } else if (!this.user)
      this.createUser()
  }
  updateUser() {
    this.loading = true
    this.http.putRequest({ url: `users/${this.user.id}`, body: this.editingUser }).subscribe({
      next: (response: any) => {
        console.log(response.user)
        this.reset()
        this.editing = false
        this.getUser()
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  createUser() {
    this.loading = true
    this.http.postRequest({ url: `users`, body: this.editingUser }).subscribe({
      next: (response: any) => {
        console.log(response.user)
        this.goBackOrCancel()
        this.loading = false
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  goBackOrCancel() {
    if (this.user && this.editing) { this.editing = false, this.reset() }
    else if ((this.user && !this.editing) || (!this.user && this.editing)) this.router.navigate(['/users'])
  }
  getUser() {
    this.loading = true
    this.http.getRequest({ url: `users/${this.userId}` }).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.loading = false
      },
      error: (error: any) => {
        console.log(error)
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.authUser = user } })
    this.userId = this.route.snapshot.queryParamMap.get('id')
    this.userId ? this.getUser() : this.editing = true
  }
}
