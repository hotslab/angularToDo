import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api';
import { selectUserData } from 'src/app/state';
import { User } from 'src/app/types';

@Component({
  selector: 'app-notifications',
  template: `
  <div class="container-fluid m-0 p-3 w-full d-flex justify-content-center align-items-center flex-wrap">
    <div class="text-light bg-black d-flex justify-content-between align-items-center w-100 p-3 rounded flex-wrap">
      <h3>{{user ? user.name + ' ' +  user.surname : 'Create User' }}</h3>
    </div>
    <div *ngFor="let notification of notifications; let i = index" class="card text-light bg-black m-3" style="height: 270px; width: 300px;">
      <div class="card-header mt-3">
        <span class="text-white-50 fw-bolder text-uppercase cursor-pointer" style="font-size: 17px;" [title]="notification.title">
          {{ notification.title.length > 30 ? notification.title.substring(0, 30) + '...' : notification.title}}
        </span>
      </div>
      <div class="card-body" style="height: 120px">
        <span class="text-secondary mb-5" style="font-size: 12px;">Status</span>
        <h5 class="card-title text-capitalize">
          <span class="text-warning" *ngIf="notification.status == 'due'">{{notification.status }}</span>  
          <span class="text-danger" *ngIf="notification.status == 'overdue'">{{notification.status }}</span>  
        </h5>
        <span class="text-secondary mb-5" style="font-size: 12px;">Due on</span>
        <h6 class="card-text">{{ notification.due_date | date: 'yyyy-MM-dd HH:mm:ss'}}</h6>
      </div>
      <div class="card-body d-flex justify-content-end align-items-center w-100">
        <a (click)="viewToDo(notification)" class="btn btn-sm btn-success ms-3">View</a>
      </div>
    </div>
    <div 
      *ngIf="notifications.length === 0"
      class="card text-light bg-black mt-3 w-100 text center d-flex justify-content-center align-items-center" 
      style="height: 320px;"
    >
      <div class="card-header mt-3"><h3>No results found</h3></div>
    </div>
  </div>
  <app-spinner *ngIf="loading"/>
  `
})
export class NotificationsComponent implements OnInit {
  constructor(
    private http: ApiService,
    private router: Router,
    private readonly store: Store,
  ) { }

  a = 'sdk;dsa;kd;askd;kasdasadasddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
  notifications: any[] = []
  user: User | null = null
  errorMessage: string | null = null
  loading: boolean = false

  viewToDo(notification: any) {
    this.loading = true
    this.http.putRequest({ url: `notifications/${notification.id}`, body: {} }).subscribe({
      next: () => {
        this.loading = false
        this.router.navigate(['/todo'], { queryParams: { id: notification.to_do_id } })
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  getNotifications(): string | void {
    if (!this.user) return this.errorMessage = 'User not found'
    this.loading = true
    this.http.getRequest({ url: `notifications`, options: { params: { userId: this.user.id } } }).subscribe({
      next: (response: any) => {
        this.notifications = response.notifications
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
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.user = user } })
    this.getNotifications()
  }
}
