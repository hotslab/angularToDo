import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first, mergeMap } from 'rxjs';
import { ApiService } from 'src/app/services/api';
import { selectUserData } from 'src/app/state';
import { User } from 'src/app/types';

@Component({
  selector: 'app-todos',
  template: `
  <div class="container-fluid m-0 p-0 w-full d-flex justify-content-center align-items-center flex-wrap">
    <div class="container-fluid text-light bg-black w-100 m-3 p-3 rounded">
      <div class="row mb-3">
        <div class="col-12 col-sm-9 col-md-10">
          <h3>ToDos <span class="text-white-50">{{toDos.length}}</span></h3>
        </div>
        <div class="col-12 col-sm-3 col-md-2 d-flex justify-content-end align-items-center">
          <a (click)="goToToDo()" class="btn btn-sm w-100 btn-success">New Todo</a>
        </div>
      </div>
      <div class="row gx-5 gy-3">
        <div class="col-12 col-sm-6 col-md-3">
          <input [(ngModel)]="title" class="form-control form-control-sm" type="text" placeholder="Search title.." aria-label=".form-control-sm example">
        </div>
        <div class="col-12 col-sm-6 3 col-md-3">
          <input [(ngModel)]="content" class="form-control form-control-sm" type="text" placeholder="Search content..." aria-label=".form-control-sm example">
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <div class="form-check form-switch">
            <input 
              class="form-check-input" 
              type="checkbox" 
              [(ngModel)]="completed" name="completed"
              id="completed"
            >
            <label class="form-check-label" style="font-size: 15px;" for="flexCheckIndeterminate">
              Completed
            </label>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <div class="row">
            <div class="col-6">
              <a (click)="resetSearch()" class="btn btn-sm w-100 btn-danger">Reset</a>
            </div>
            <div class="col-6">
              <a (click)="getToDos()" class="btn btn-sm w-100 btn-success">Search</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div *ngFor="let toDo of toDos; let i = index" class="card text-light bg-black m-3" style="height: 320px; width: 300px;">
      <div class="card-header mt-3">Due on <span class="text-white-50">{{toDo.due_date | date : 'YYYY-MM-dd HH:mm:ss'}}</span></div>
      <div class="card-body">
        <h5 class="card-title overflow-hidden" style="height: 50px">
          {{ toDo.title && toDo.title.length > 35 ? toDo.title.substring(0, 35) + '...' : toDo.title}}
        </h5>
        <p class="card-text overflow-hidden" style="height: 100px">
          {{ toDo.content && toDo.content.length > 100 ? toDo.content.substring(0, 100) + '...' : toDo.content}}
        </p>
      </div>
      <div class="card-body d-flex justify-content-end align-items-center w-100">
        <a (click)="showDeleteModal(toDo)" class="btn btn-sm btn-danger ms-3">Delete</a>
        <a (click)="goToToDo(toDo)" class="btn btn-sm btn-success ms-3">View</a>
      </div>
    </div>
    <div 
      *ngIf="toDos.length === 0"
      class="card text-light bg-black m-3 w-100 text center d-flex justify-content-center align-items-center" 
      style="height: 320px;"
    >
      <div class="card-header mt-3"><h3>No results found</h3></div>
    </div>
  </div>
  <app-modal *ngIf="selectedToDo">
    <div class="modal-header">
      <h5 class="modal-title text-danger">Delete {{selectedToDo.title}}?</h5>
        <button (click)="selectedToDo = null" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure?</p>
      </div>
      <div class="modal-footer">
        <button (click)="selectedToDo = null" type="button" class="btn btn-secondary">No</button>
        <button (click)="deleteToDo()" type="button" class="btn btn-danger">Yes</button>
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
  `,
})

export class TodosComponent implements OnInit {

  constructor(
    private http: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly store: Store
  ) { }

  user: User | null = null
  toDos: any[] = []
  loading: boolean = false
  errorMessage: string | null = null
  selectedToDo: any = null
  title: string | null = null
  content: string | null = null
  completed: number = 0

  resetSearch() {
    this.title = null
    this.content = null
    this.completed = 0
    this.getToDos()
  }
  showDeleteModal(toDo: any) {
    this.selectedToDo = toDo
  }
  goToToDo(toDo: any = null) {
    this.router.navigate(['/todo', toDo ? { toDoId: toDo.id } : {}])
  }
  getToDos(): string | void {
    this.loading = true
    if (!this.user) return this.errorMessage = 'User not found'
    let data: {
      userId: number, title?: string, content?: string, completed: number
    } = { userId: this.user.id, completed: this.completed ? 1 : 0 }

    if (this.title) data.title = this.title
    if (this.content) data.content = this.content

    this.http.getRequest({ url: `todos`, options: { params: data } }).subscribe({
      next: (response: any) => {
        this.toDos = response.toDos
        this.loading = false
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }
  deleteToDo() {
    this.loading = true
    this.http.deleteRequest({ url: `todos/${this.selectedToDo.id}` }).subscribe({
      next: (response: any) => {
        console.log(response.toDo)
        this.selectedToDo = null
        this.getToDos()
      },
      error: (error: any) => {
        this.errorMessage = error.message
        this.loading = false
      }
    })
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe({ next: (user: User | null) => { this.user = user } })
    this.getToDos()
  }
}
