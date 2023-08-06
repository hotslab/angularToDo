import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';
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
  postRequest: (clientData: { url: string, body: any, options?: any }): Observable<{ email: string, name: string, surname: string }> => new Observable((subscriber) => {
    subscriber.next(user)
  })
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    store = TestBed.inject(Store)
    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(http, 'postRequest').and.returnValue(of(user))
    spyOn(router, 'navigate')

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should validate if email format is valid or invalid', fakeAsync(() => {
    fixture.whenStable()
    component.loginForm.controls['email'].setValue('test.company.com')
    expect(component.loginForm.controls['email'].status).toBe('INVALID')
    component.loginForm.controls['email'].setValue('test@company.com')
    expect(component.loginForm.controls['email'].status).toBe('VALID')
  }))

  it('should validate loginForm with incorrect data as invaid and disables submission button', fakeAsync(() => {
    fixture.whenStable()
    component.loginForm.controls['email'].setValue('test.company.com')
    component.loginForm.controls['password'].setValue('')
    fixture.detectChanges()
    tick()
    expect(component.loginForm.controls['email'].status).toBe('INVALID')
    expect(component.loginForm.controls['password'].status).toBe('INVALID')
    expect(component.loginForm.status).toBe('INVALID')
    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(component.credentials.email).toBe('test.company.com')
    expect(component.credentials.password).toBe('')
    expect(submit.disabled).toBeTrue()
  }))

  it('should validate loginForm with correct data as vaid and submits the data', fakeAsync(() => {
    fixture.whenStable()
    component.loginForm.controls['email'].setValue('test@company.com')
    component.loginForm.controls['password'].setValue('test')
    fixture.detectChanges()
    tick()
    expect(component.loginForm.controls['email'].status).toBe('VALID')
    expect(component.loginForm.controls['password'].status).toBe('VALID')
    expect(component.loginForm.status).toBe('VALID')
    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(component.credentials.email).toBe('test@company.com')
    expect(component.credentials.password).toBe('test')
    expect(submit.disabled).toBeFalse()
    submit.click()
    expect(http.postRequest).toHaveBeenCalledWith({
      url: 'login',
      body: {
        email: component.credentials.email,
        password: component.credentials.password,
      }
    })
    expect(router.navigate).toHaveBeenCalledWith(['/todos'])
  }))
})
