import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { RegisterComponent } from './register.component';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as fromRoot from '../../state';
import * as fromFeature from '../../state/reducers/user.reducer';
import { ApiService } from 'src/app/services/api';
import { Observable, of } from 'rxjs';
import { TodosComponent } from '../todos/todos.component';
import { Router } from '@angular/router'

let user = {
  email: 'test@company.com',
  name: 'test',
  surname: 'company',
  password: 'test'
}

let testApiService: Partial<ApiService> = {
  postRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next(user)
  })
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
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

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    store = TestBed.inject(Store)
    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(http, 'postRequest').and.returnValue(of(user))
    spyOn(router, 'navigate')

    fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email to either be in a valid or invalid format', fakeAsync(() => {
    fixture.whenStable()
    component.registerForm.controls['email'].setValue('test.company.com')
    expect(component.registerForm.controls['email'].status).toBe('INVALID')
    component.registerForm.controls['email'].setValue('test@company.com')
    expect(component.registerForm.controls['email'].status).toBe('VALID')
  }))

  it('should be able to see a registerForm with incorrect data as invaid and disables submission button', fakeAsync(() => {
    fixture.whenStable()
    component.registerForm.controls['email'].setValue('test.company.com')
    component.registerForm.controls['name'].setValue('')
    component.registerForm.controls['surname'].setValue('')
    component.registerForm.controls['password'].setValue('')
    fixture.detectChanges()
    tick()
    expect(component.registerForm.controls['email'].status).toBe('INVALID')
    expect(component.registerForm.controls['name'].status).toBe('INVALID')
    expect(component.registerForm.controls['surname'].status).toBe('INVALID')
    expect(component.registerForm.controls['password'].status).toBe('INVALID')
    expect(component.registerForm.status).toBe('INVALID')
    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(component.credentials.email).toBe('test.company.com')
    expect(component.credentials.name).toBe('')
    expect(component.credentials.surname).toBe('')
    expect(component.credentials.password).toBe('')
    expect(submit.disabled).toBeTrue()
  }))

  it('should be able to see a registerForm with correct data as valid and enables the submission of the data', fakeAsync(() => {
    fixture.whenStable()
    component.registerForm.controls['email'].setValue('test@company.com')
    component.registerForm.controls['name'].setValue('test')
    component.registerForm.controls['surname'].setValue('company')
    component.registerForm.controls['password'].setValue('test')
    fixture.detectChanges()
    tick()
    expect(component.registerForm.controls['email'].status).toBe('VALID')
    expect(component.registerForm.controls['name'].status).toBe('VALID')
    expect(component.registerForm.controls['surname'].status).toBe('VALID')
    expect(component.registerForm.controls['password'].status).toBe('VALID')
    expect(component.registerForm.status).toBe('VALID')
    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(component.credentials.email).toBe('test@company.com')
    expect(component.credentials.name).toBe('test')
    expect(component.credentials.surname).toBe('company')
    expect(component.credentials.password).toBe('test')
    expect(submit.disabled).toBeFalse()
    submit.click()
    expect(http.postRequest).toHaveBeenCalledWith({
      url: 'register',
      body: {
        email: component.credentials.email,
        name: component.credentials.name,
        surname: component.credentials.surname,
        password: component.credentials.password,
      }
    })
    expect(router.navigate).toHaveBeenCalledWith(['/todos'])
  }))
})
