import { Time, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api';
import { selectUserData } from 'src/app/state';
import { User } from 'src/app/types';

@Component({
  selector: 'app-todo',
  template: `
  <div class="container-fluid m-0 p-3 d-flex flex-column justify-content-center align-items-center">
    <div class="text-light bg-black d-flex justify-content-between align-items-center w-100 p-3 rounded flex-wrap">
      <h3>{{toDo ? toDo.title : 'To Do' }}</h3>
      <div class="d-flex justify-content-end align-items-center">
        <a (click)="goBackOrCancel()" class="btn btn-sm btn-danger">{{ this.editing ? 'Cancel' : 'Back'}}</a>
        <a *ngIf="!editing" (click)="markAsComplete()" title="Mark as done" class="btn btn-sm btn-primary ms-3">Done</a>
        <a *ngIf="!editing" (click)="openEditing()" title="Edit ToDo" class="btn btn-sm btn-success ms-3">Edit</a>
      </div>
    </div>
    <div *ngIf="toDo && !editing" class="card mt-5 text-center w-100">
      <div class="card-body">
        <p class="card-text fs-3">{{toDo.content}}</p>
      </div>
      <div class="card-footer text-black">
        Due on <span class="text-secondary">{{ toDo.due_date | date: 'YYYY-MM-dd HH:mm:ss'}}</span>
      </div>
    </div>
    <div *ngIf="editing" class="container mt-5">
      <div class="row align-items-center justify-content-center">
        <div class="card col-12 col-sm-6">
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #toDoForm="ngForm">
              <div class="form-group mb-3">
                <label for="title" class="form-label">Title</label>
                <input 
                  type="title" 
                  class="form-control"
                  id="title" 
                  required
                  [(ngModel)]="editingToDo.title" name="title"
                  #title="ngModel"
                >
                <div *ngIf="title.invalid && (title.dirty || title.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="title.errors?.['required']">
                    Title is required.
                  </div>
                </div>
              </div>
              <div class="form-group mb-4">
                <label for="content">Content</label>
                <input 
                  type="text" 
                  class="form-control"
                  id="content"
                  role="switch"
                  required
                  [(ngModel)]="editingToDo.content" name="content"
                  #content="ngModel"
                >
                <div *ngIf="content.invalid && (content.dirty || content.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="content.errors?.['required']">
                    Content is required.
                  </div>
                </div>
              </div>
              <div class="form-check form-switch mb-3">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  [(ngModel)]="editingToDo.completed" name="completed"
                  id="completed"
                >
                <label class="form-check-label" for="flexCheckIndeterminate">
                  Completed
                </label>
              </div>
              <div class="form-group mb-3">
                <label for="date">Due Date</label>
                <input 
                  type="date" 
                  class="form-control"
                  id="date"
                  required
                  [(ngModel)]="editingToDo.date" name="date"
                  #date="ngModel"
                >
                <div *ngIf="date.invalid && (date.dirty || date.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="date.errors?.['required']">
                    Date is required.
                  </div>
                </div>
              </div>
              <div class="form-group mb-3">
                <label for="time">Time</label>
                <input 
                  type="time" 
                  class="form-control"
                  id="time"
                  required
                  [(ngModel)]="editingToDo.time" name="time"
                  #time="ngModel"
                >
                <div *ngIf="time.invalid && (time.dirty || time.touched)" class="alert alert-danger fs-6 mb-3">
                  <div *ngIf="time.errors?.['required']">
                    Time is required.
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="card-footer text-body-secondary d-flex justify-content-end align-items-center">
            <button *ngIf="!toDo" type="button" class="btn btn-danger" (click)="toDoForm.reset(); reset();">Reset</button>
            <button type="submit" class="btn btn-success ms-3" (click)="onSubmit()" [disabled]="!toDoForm.form.valid || loading">Submit</button>
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
})

export class TodoComponent implements OnInit {
  constructor(
    private http: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly store: Store,
  ) { }

  user: User | null = null
  toDo: any = null
  toDoId: string | null = null
  loading: boolean = false
  errorMessage: string | null = null
  selectedToDo: any = null
  editing: boolean = false
  editingToDo: {
    title: string | null
    content: string | null
    completed: number
    date: any | null,
    time: any | null,
    due_date: string | null
    user_id: number | null
  } = {
      title: null,
      content: null,
      completed: 0,
      date: null,
      time: null,
      due_date: null,
      user_id: null
    }

  reset() {
    const dateTime = this.toDo ? new Date(this.toDo.due_date) : new Date()
    console.log('DATE', dateTime)
    this.editingToDo.title = null
    this.editingToDo.content = null
    this.editingToDo.completed = 0
    this.editingToDo.due_date = null
    this.editingToDo.user_id = null
    this.editingToDo.date = formatDate(dateTime, 'yyyy-MM-dd', 'en-US')
    this.editingToDo.time = formatDate(dateTime, 'HH:ss', 'en-US')
  }
  setValues() {
    const date = new Date(this.toDo.due_date)
    this.editingToDo.date = formatDate(date, 'yyyy-MM-dd', 'en-US')
    this.editingToDo.time = formatDate(date, 'HH:ss', 'en-US')
    this.editingToDo.title = this.toDo.title
    this.editingToDo.content = this.toDo.content
    this.editingToDo.completed = this.toDo.completed
    this.editingToDo.due_date = this.toDo.due_date
  }
  openEditing() {
    this.setValues()
    this.editing = true
  }
  markAsComplete() {
    this.editingToDo.completed = 1
    this.setValues()
    this.updateTodo()
  }
  onSubmit() {
    const dateTime = `${this.editingToDo.date} ${this.editingToDo.time}:00`
    let currentTime = new Date().getTime()
    if (this.toDo) {
      const savedDate = new Date(this.toDo.due_date).getTime()
      currentTime = currentTime < savedDate ? currentTime : savedDate
    }
    console.log(dateTime)
    if (
      (!this.toDo && new Date(dateTime).getTime() < currentTime)
      || (this.toDo && new Date(dateTime).getTime() < currentTime)
    ) this.errorMessage = 'The date set is in the past'
    else {
      this.editingToDo.due_date = dateTime
      this.editingToDo.user_id = Number(this.user?.id)
      if (this.toDo)
        this.updateTodo()
      else if (!this.toDo)
        this.createToDo()
    }
  }
  updateTodo() {
    this.loading
    this.http.putRequest({ url: `todos/${this.toDo.id}`, body: this.editingToDo }).subscribe({
      next: (response: any) => {
        console.log(response.toDos)
        this.reset()
        this.editing = false
        this.getToDo()
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  createToDo() {
    this.loading
    this.http.postRequest({ url: `todos`, body: this.editingToDo }).subscribe({
      next: (response: any) => {
        console.log(response.toDos)
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
    if (this.toDo && this.editing) { this.editing = false, this.reset() }
    else if ((this.toDo && !this.editing) || (!this.toDo && this.editing)) this.router.navigate(['/todos'])
  }
  getToDo() {
    this.loading = true
    this.http.getRequest({ url: `todos/${this.toDoId}` }).subscribe({
      next: (response: any) => {
        this.toDo = response.toDos
        this.loading = false
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }

  ngOnInit(): void {
    const date = new Date()
    this.editingToDo.date = formatDate(date, 'yyyy-MM-dd', 'en-US')
    this.editingToDo.time = formatDate(date, 'HH:ss', 'en-US')
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.user = user } })
    this.toDoId = this.route.snapshot.paramMap.get('toDoId')
    this.toDoId ? this.getToDo() : this.editing = true
  }
}
