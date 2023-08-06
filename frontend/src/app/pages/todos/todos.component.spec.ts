import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { TodosComponent } from './todos.component';
import { TodoComponent } from '../todo/todo.component';
import { ModalComponent } from 'src/app/component/modal/modal.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as fromRoot from '../../state';
import * as fromFeature from '../../state/reducers/user.reducer';
import { ApiService } from 'src/app/services/api';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

let user = {
  id: 1,
  email: 'test@company.com',
  name: 'test',
  surname: 'company',
  password: 'test',
  role: 'user',
  remember_me_token: null,
  created_at: '2023-10-10 12:00:00',
  updated_at: '2023-10-10 12:00:00'

}

let token = {
  type: 'test',
  token: 'testToken',
  expires_at: '2023-10-10 12:00:00'
}

let todos = [
  {
    id: 1,
    title: 'Test Todo',
    content: ' Test ToDo content',
    completed: 0,
    dueDate: '2023-10-10 10:25:00',
    userId: 1
  },
  {
    id: 2,
    title: 'Another Test Todo2',
    content: 'Another Test ToDo content',
    completed: 0,
    dueDate: '2023-10-10 10:30:00',
    userId: 1
  }
]

let testApiService: Partial<ApiService> = {
  getRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next({ toDos: todos })
  }),
  deleteRequest: (clientData: { url: string, body?: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  })
}

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [TodosComponent, ModalComponent],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'todo', component: TodoComponent }
        ]),
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromFeature.userReducer),
        }),
      ],
      providers: [
        { provide: ApiService, useValue: testApiService },
      ],
    })

    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    store = TestBed.inject(Store)

    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(store, 'select').and.callFake(() => of(user))
    spyOn(http, 'getRequest').and.callThrough()
    spyOn(router, 'navigate')

    component.ngOnInit()

    await fixture.whenStable()
    fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should get the authenticated user from store', fakeAsync(() => {
    expect(store.select).toHaveBeenCalled()
    expect(component.user).toEqual(user)
  }))

  it('should get the toDos from api', fakeAsync(() => {
    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'todos', options: {
          params: {
            userId: user.id,
            completed: 0,
            order: 'desc'
          }
        }
      })
    expect(component.toDos).toEqual(todos)
  }))

  it('should be able to do a search with updated search parameters', fakeAsync(() => {
    const title: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#title')
    const content: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#content')
    const completed: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#completed')
    const order: HTMLSelectElement = fixture.debugElement.nativeElement.querySelector('#order')

    title.value = 'Test ToDo'
    title.dispatchEvent(new Event('input'));
    content.value = 'Test ToDo content'
    content.dispatchEvent(new Event('input'));
    order.value = 'asc'
    order.dispatchEvent(new Event('change'));
    completed.click()
    completed.dispatchEvent(new Event('change'));

    fixture.whenStable()
    fixture.detectChanges()

    expect(component.title).toBe('Test ToDo')
    expect(component.content).toEqual('Test ToDo content')
    expect(component.completed).toBeTrue()
    expect(component.order).toEqual('asc')

    const search: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#search')
    search.click()

    fixture.whenStable()
    fixture.detectChanges()

    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'todos', options: {
          params: {
            userId: user.id,
            completed: 1,
            order: 'asc',
            title: 'Test ToDo',
            content: 'Test ToDo content'
          }
        }
      })
    expect(component.toDos).toEqual(todos)
  }))

  it('should be able to go to a selected ToDo when its view button is clicked', fakeAsync(() => {
    const view: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#view')
    expect(view).toBeTruthy()
    view.click()
    expect(component.selectedToDo).toBeNull()
    expect(router.navigate).toHaveBeenCalledOnceWith(['/todo'], { queryParams: { id: 1 } })
  }))

  it('should show delete modal before deleting selected ToDo and then delete the ToDo', fakeAsync(() => {
    spyOn(http, 'deleteRequest').and.callThrough()
    const deleteToDo: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#delete')
    deleteToDo.click()

    fixture.whenStable()
    fixture.detectChanges()

    expect(component.selectedToDo).toBeTruthy()
    const deleteModal: HTMLElement = fixture.debugElement.nativeElement.querySelector('#delete-modal')
    expect(deleteModal).toBeTruthy()
    const confirmDelete: HTMLElement = fixture.debugElement.nativeElement.querySelector('#confirm-delete')
    expect(confirmDelete).toBeTruthy()
    confirmDelete.click()

    expect(http.deleteRequest).toHaveBeenCalledWith({ url: 'todos/1' })
    expect(component.selectedToDo).toBeNull()
    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'todos', options: {
          params: {
            userId: user.id,
            completed: 0,
            order: 'desc'
          }
        }
      })
    expect(component.toDos).toEqual(todos)
  }))
})
