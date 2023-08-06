import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
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
        <a id="mark-complete" *ngIf="!editing" (click)="markAsComplete()" title="Mark as done" class="btn btn-sm btn-primary ms-3">Done</a>
        <a id="open-editing" *ngIf="!editing" (click)="openEditing()" title="Edit ToDo" class="btn btn-sm btn-success ms-3">Edit</a>
      </div>
    </div>
    <div id="todo" *ngIf="toDo && !editing" class="card mt-5 text-center w-100">
      <div class="card-body">
        <p class="card-text fs-3">{{toDo.content}}</p>
      </div>
      <div class="card-footer text-black">
        Due on <span class="text-secondary">{{ toDo.due_date | date: "YYYY-MM-dd 'at' HH:mm:ss"}}</span>
      </div>
    </div>
    <div id="todo-editing" *ngIf="editing" class="container mt-5">
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
            <button id="reset" *ngIf="!toDo" type="button" class="btn btn-danger" (click)="reset(); toDoForm.reset();">Reset</button>
            <button id="submit" type="submit" class="btn btn-success ms-3" (click)="onSubmit()" [disabled]="!toDoForm.form.valid || loading">Submit</button>
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

  @ViewChild('toDoForm')
  toDoForm!: NgForm;

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
    completed: boolean
    date: any | null,
    time: any | null,
    due_date: string | null
    user_id: number | null
  } = {
      title: null,
      content: null,
      completed: false,
      date: null,
      time: null,
      due_date: null,
      user_id: null
    }

  reset() {
    this.editingToDo = {
      title: null,
      content: null,
      completed: false,
      date: null,
      time: null,
      due_date: null,
      user_id: null
    }
  }
  setValues() {
    const date = new Date(this.toDo.due_date)
    this.editingToDo.date = formatDate(date, 'yyyy-MM-dd', 'en-US')
    this.editingToDo.time = formatDate(date, 'HH:mm:ss', 'en-US')
    this.editingToDo.title = this.toDo.title
    this.editingToDo.content = this.toDo.content
    this.editingToDo.completed = Boolean(this.toDo.completed) ? true : false
    this.editingToDo.due_date = formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US')
  }
  openEditing() {
    this.setValues()
    this.editing = true
  }
  markAsComplete() {
    this.setValues()
    this.editingToDo.user_id = Number(this.user?.id)
    this.editingToDo.completed = true
    this.updateTodo()
  }
  onSubmit() {
    const dateTime = `${this.editingToDo.date} ${this.editingToDo.time}`
    let currentTime = new Date().getTime()
    if (this.toDo) {
      const savedDate = new Date(this.toDo.due_date).getTime()
      currentTime = currentTime < savedDate ? currentTime : savedDate
    }
    if (
      (!this.toDo && new Date(dateTime).getTime() < currentTime)
      || (this.toDo && new Date(dateTime).getTime() < currentTime)
    ) this.errorMessage = 'The date set is in the past'
    else {
      this.editingToDo.user_id = Number(this.user?.id)
      this.editingToDo.due_date = formatDate(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss', 'en-US')
      if (this.toDo) this.updateTodo()
      else if (!this.toDo) this.createToDo()
    }
  }
  updateTodo() {
    this.loading = true
    this.http.putRequest({
      url: `todos/${this.toDo.id}`,
      body: { ...this.editingToDo, completed: this.editingToDo.completed ? 1 : 0 }
    }).subscribe({
      next: (response: any) => {
        if (this.editing) {
          this.reset()
          this.editing = false
          this.getToDo()
        } else this.goBackOrCancel()
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  createToDo() {
    this.loading = true
    this.http.postRequest({
      url: `todos`,
      body: { ...this.editingToDo, completed: this.editingToDo.completed ? 1 : 0 }
    }).subscribe({
      next: (response: any) => {
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
        this.toDo = response.toDo
        this.loading = false
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.user = user } })
    this.toDoId = this.route.snapshot.queryParamMap.get('id')
    this.toDoId ? this.getToDo() : this.editing = true
  }
}
