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

enum Order {
  DESC = 'desc',
  ASC = 'asc'
}

@Component({
  selector: 'app-users',
  template: `
  <div class="container-fluid m-0 p-0 w-full d-flex justify-content-center align-items-center flex-wrap">
    <div class="container-fluid text-light bg-black w-100 m-3 p-3 rounded">
      <div class="row mb-3">
        <div class="col-12 col-sm-9 col-md-10">
          <h3>Users <span class="text-white-50">{{users.length}}</span></h3>
        </div>
        <div class="col-12 col-sm-3 col-md-2 d-flex justify-content-end align-items-center">
          <a (click)="goToUser()" class="btn btn-sm w-100 btn-success">New User</a>
        </div>
      </div>
      <div class="row gx-5 gy-3 mb-3">
        <div class="col-12 col-sm-4 col-xl-2">
          <input [(ngModel)]="email" class="form-control form-control-sm" type="text" placeholder="Search email.." aria-label=".form-control-sm example">
        </div>
        <div class="col-12 col-sm-4 col-xl-2">
          <input [(ngModel)]="name" class="form-control form-control-sm" type="text" placeholder="Search name..." aria-label=".form-control-sm example">
        </div>
        <div class="col-12 col-sm-4 col-xl-2">
          <input [(ngModel)]="surname" class="form-control form-control-sm" type="text" placeholder="Search surname..." aria-label=".form-control-sm example">
        </div>
        <div class="col-12 col-sm-4 col-xl-2">
          <select [(ngModel)]="role" class="form-select form-select-sm" aria-label="Select roles">
            <option value="user" selected>User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="col-12 col-sm-4 col-xl-2">
          <select [(ngModel)]="order" class="form-select form-select-sm" aria-label="Select roles">
            <option value="desc" selected>Latest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
        <div class="col-12 col-sm-4 col-xl-2">
          <div class="row">
            <div class="col-6">
              <a (click)="resetSearch()" class="btn btn-sm w-100 btn-danger">Reset</a>
            </div>
            <div class="col-6">
              <a (click)="getUsers()" class="btn btn-sm w-100 btn-success">Search</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div *ngFor="let user of users; let i = index" class="card text-light bg-black m-3" style="height: 270px; width: 300px;">
      <div class="card-header mt-3">
        <span class="text-white-50 fw-bolder text-uppercase" style="font-size: 17px;">{{ user.name + ' ' + user.surname}}</span>
      </div>
      <div class="card-body" style="height: 120px">
        <span class="text-secondary mb-5" style="font-size: 12px;">Email</span>
        <h5 class="card-title">{{user.email }}</h5>
        <span class="text-secondary mb-5" style="font-size: 12px;">Registered</span>
        <h6 class="card-text">{{ user.created_at | date: 'yyyy-MM-dd HH:mm:ss'}}</h6>
      </div>
      <div class="card-body d-flex justify-content-end align-items-center w-100">
        <a (click)="showDeleteModal(user)" class="btn btn-sm btn-danger ms-3">Delete</a>
        <a (click)="goToUser(user)" class="btn btn-sm btn-success ms-3">View</a>
      </div>
    </div>
    <div 
      *ngIf="users.length === 0"
      class="card text-light bg-black m-3 w-100 text center d-flex justify-content-center align-items-center" 
      style="height: 320px;"
    >
      <div class="card-header mt-3"><h3>No results found</h3></div>
    </div>
  </div>
  <app-modal *ngIf="selectedUser">
    <div class="modal-header">
      <h5 class="modal-title text-danger">Delete {{selectedUser.name + ' ' + selectedUser.surname}}?</h5>
        <button (click)="selectedUser = null" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure?</p>
      </div>
      <div class="modal-footer">
        <button (click)="selectedUser = null" type="button" class="btn btn-secondary">No</button>
        <button (click)="deleteUser()" type="button" class="btn btn-danger">Yes</button>
      </div>
    </app-modal>
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
  `
})
export class UsersComponent implements OnInit {

  constructor(
    private http: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly store: Store
  ) { }

  user: User | null = null
  users: any[] = []
  loading: boolean = false
  errorMessage: string | null = null
  selectedUser: any = null
  email: string | null = null
  name: string | null = null
  surname: string | null = null
  role: Roles = Roles.USER
  order: Order = Order.DESC

  resetSearch() {
    this.email = null
    this.name = null
    this.surname = null
    this.role = Roles.USER
    this.order = Order.DESC
    this.getUsers()
  }
  showDeleteModal(user: any) {
    this.selectedUser = user
  }
  goToUser(user: any = null) {
    this.router.navigate(['/user'], user ? { queryParams: { id: user.id } } : {})
  }
  getUsers(): string | void {
    this.loading = true
    if (!this.user) return this.errorMessage = 'User not found'
    let searchParams: {
      email?: string, name?: string, surname?: string, role: Roles, order: Order
    } = { role: this.role, order: this.order }

    if (this.email) searchParams.email = this.email
    if (this.name) searchParams.name = this.name
    if (this.surname) searchParams.surname = this.surname

    this.http.getRequest({ url: `users`, options: { params: searchParams } }).subscribe({
      next: (response: any) => {
        this.users = response.users
        this.loading = false
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  deleteUser() {
    this.loading = true
    this.http.deleteRequest({ url: `users/${this.selectedUser.id}` }).subscribe({
      next: (response: any) => {
        console.log(response.user)
        this.selectedUser = null
        this.getUsers()
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.user = user } })
    this.getUsers()
  }
}

