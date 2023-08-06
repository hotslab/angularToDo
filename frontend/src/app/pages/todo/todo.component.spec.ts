import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TodoComponent } from './todo.component';
import { TodosComponent } from '../todos/todos.component';
import { ModalComponent } from 'src/app/component/modal/modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as fromRoot from '../../state';
import * as fromFeature from '../../state/reducers/user.reducer';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { Observable, of } from 'rxjs';
import { SpinnerComponent } from 'src/app/component/spinner/spinner.component';


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

let todo: Object | null = {
  id: 1,
  title: 'Test ToDo',
  content: 'Test ToDo content',
  completed: false,
  due_date: '2023-10-10 10:25:00',
  user_id: 1
}

let testApiService: Partial<ApiService> = {
  getRequest: (clientData: { url: string, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next({ toDo: todo })
  }),
  postRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  }),
  putRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  })
}

describe('TodoComponent', () => {
  let component: TodoComponent
  let fixture: ComponentFixture<TodoComponent>
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>
  let route: ActivatedRoute
  let routeSpy: jasmine.Spy

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [TodoComponent, ModalComponent, SpinnerComponent],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'todos', component: TodosComponent }
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

    fixture = TestBed.createComponent(TodoComponent);
    component = fixture.componentInstance;

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    route = TestBed.inject(ActivatedRoute)
    store = TestBed.inject(Store)

    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(store, 'select').and.callFake(() => of(user))
    spyOn(http, 'getRequest').and.callThrough()
    spyOn(http, 'postRequest').and.callThrough()
    spyOn(http, 'putRequest').and.callThrough()
    spyOn(router, 'navigate')
    routeSpy = spyOn(route.snapshot.queryParamMap, 'get')
    routeSpy.and.returnValue('1')

    component.ngOnInit()

    await fixture.whenStable()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should get the authenticated user from store', fakeAsync(() => {
    expect(store.select).toHaveBeenCalled()
    expect(component.user).toEqual(user)
  }))

  it('should fetch ToDo from api if route has a ToDoId in its query params', fakeAsync(() => {
    expect(component.toDoId).toBe('1')
    expect(http.getRequest).toHaveBeenCalledWith({ url: 'todos/1' })
    expect(component.toDo).toEqual(todo)
  }))

  it('should mark ToDo as done by posting requesting to api when button titled Done is clicked', fakeAsync(() => {
    expect(component.user).toEqual(user)
    const markedAsDoneButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#mark-complete')
    expect(markedAsDoneButton).toBeTruthy()
    expect(markedAsDoneButton.textContent).toBe('Done')
    markedAsDoneButton.click()

    fixture.detectChanges()
    tick()

    expect(component.user).toEqual(user)
    expect(http.putRequest).toHaveBeenCalledOnceWith({
      url: 'todos/1',
      body: {
        title: 'Test ToDo',
        content: 'Test ToDo content',
        date: '2023-10-10',
        time: '10:25:00',
        completed: 1,
        due_date: '2023-10-10 10:25:00',
        user_id: Number(component.user?.id)
      }
    })
    expect(router.navigate).toHaveBeenCalledOnceWith(['/todos'])
  }))


  it('should go to editing mode when route has no ToDoId in its query params', fakeAsync(() => {
    component.toDo = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)
    component.ngOnInit()

    fixture.detectChanges()

    expect(component.editing).toBeTrue()
    expect(component.toDoId).toBeNull()
    expect(component.toDo).toBeNull()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#todo-editing')
    expect(editingSection).toBeTruthy()
  }))

  it('should validate form data to be incorrect to create the new ToDo, and should disable the submit button', fakeAsync(() => {
    component.toDo = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)

    component.ngOnInit()
    fixture.detectChanges()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#todo-editing')
    expect(editingSection).toBeTruthy()

    fixture.detectChanges()
    tick()

    component.toDoForm.controls['title'].setValue('')
    component.toDoForm.controls['content'].setValue('')
    component.toDoForm.controls['date'].setValue('')
    component.toDoForm.controls['time'].setValue('')

    fixture.detectChanges()
    tick()

    expect(component.toDoForm.controls['title'].status).toBe('INVALID')
    expect(component.toDoForm.controls['content'].status).toBe('INVALID')
    expect(component.toDoForm.controls['date'].status).toBe('INVALID')
    expect(component.toDoForm.controls['time'].status).toBe('INVALID')
    expect(component.toDoForm.status).toBe('INVALID')

    expect(component.editingToDo.title).toBe('')
    expect(component.editingToDo.content).toBe('')
    expect(component.editingToDo.date).toBe('')
    expect(component.editingToDo.time).toBe('')
    expect(component.editingToDo.completed).toBeFalse()

    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(submit.disabled).toBeTrue()
  }))

  it('should validate the  form data to be correct to create new ToDo, and should enable the submit button, and finally should then submit the new ToDo', fakeAsync(() => {
    component.toDo = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)
    component.ngOnInit()
    fixture.detectChanges()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#todo-editing')
    expect(editingSection).toBeTruthy()

    fixture.detectChanges()
    tick()

    component.toDoForm.controls['title'].setValue('New Test ToDo')
    component.toDoForm.controls['content'].setValue('New Test ToDo Content')
    component.toDoForm.controls['date'].setValue('2023-10-10')
    component.toDoForm.controls['time'].setValue('11:25:00')

    fixture.detectChanges()
    tick()

    expect(component.toDoForm.controls['title'].status).toBe('VALID')
    expect(component.toDoForm.controls['content'].status).toBe('VALID')
    expect(component.toDoForm.controls['date'].status).toBe('VALID')
    expect(component.toDoForm.controls['time'].status).toBe('VALID')
    expect(component.toDoForm.status).toBe('VALID')

    expect(component.editingToDo.title).toBe('New Test ToDo')
    expect(component.editingToDo.content).toBe('New Test ToDo Content')
    expect(component.editingToDo.date).toBe('2023-10-10')
    expect(component.editingToDo.time).toBe('11:25:00')
    expect(component.editingToDo.completed).toBeFalse()

    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(submit.disabled).toBeFalse()
    submit.click()

    fixture.detectChanges()
    tick()

    expect(component.user).toEqual(user)
    expect(http.postRequest).toHaveBeenCalledOnceWith({
      url: 'todos',
      body: {
        title: 'New Test ToDo',
        content: 'New Test ToDo Content',
        date: '2023-10-10',
        time: '11:25:00',
        completed: 0,
        due_date: '2023-10-10 11:25:00',
        user_id: Number(component.user?.id)
      }
    })
  }))

  it('should validate correct form data to update ToDo, and should enable the submit button, and finally submit the updated ToDo', fakeAsync(() => {

    const editingButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#open-editing')
    expect(editingButton).toBeTruthy()
    editingButton.click()
    fixture.detectChanges()
    tick()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#todo-editing')
    expect(editingSection).toBeTruthy()

    expect(component.editingToDo.title).toBe('Test ToDo')
    expect(component.editingToDo.content).toBe('Test ToDo content')
    expect(component.editingToDo.date).toBe('2023-10-10')
    expect(component.editingToDo.time).toBe('10:25:00')
    expect(component.editingToDo.completed).toBeFalse()

    fixture.whenStable()
    fixture.detectChanges()
    tick()

    component.toDoForm.controls['title'].setValue('New Test ToDo')
    component.toDoForm.controls['content'].setValue('New Test ToDo Content')
    component.toDoForm.controls['date'].setValue('2023-10-10')
    component.toDoForm.controls['time'].setValue('10:40:00')

    fixture.detectChanges()
    tick()

    expect(component.toDoForm.controls['title'].status).toBe('VALID')
    expect(component.toDoForm.controls['content'].status).toBe('VALID')
    expect(component.toDoForm.controls['date'].status).toBe('VALID')
    expect(component.toDoForm.controls['time'].status).toBe('VALID')
    expect(component.toDoForm.status).toBe('VALID')

    expect(component.editingToDo.title).toBe('New Test ToDo')
    expect(component.editingToDo.content).toBe('New Test ToDo Content')
    expect(component.editingToDo.date).toBe('2023-10-10')
    expect(component.editingToDo.time).toBe('10:40:00')
    expect(component.editingToDo.completed).toBeFalse()

    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(submit).toBeTruthy()
    expect(submit.disabled).toBeFalse()
    submit.click()

    fixture.detectChanges()
    tick()

    expect(component.user).toEqual(user)
    expect(http.putRequest).toHaveBeenCalledOnceWith({
      url: 'todos/1',
      body: {
        title: 'New Test ToDo',
        content: 'New Test ToDo Content',
        date: '2023-10-10',
        time: '10:40:00',
        completed: 0,
        due_date: '2023-10-10 10:40:00',
        user_id: Number(component.user?.id)
      }
    })
  }))
})
