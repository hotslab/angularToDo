import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { UserComponent } from './user.component';
import { UsersComponent } from './../users/users.component';
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

let authUser = {
  id: 1,
  email: 'manager@continental.com',
  name: 'Winston',
  surname: 'Scott',
  role: 'admin',
  password: 'test',
  remember_me_token: null,
  created_at: '2023-10-10 12:00:00',
  updated_at: '2023-10-10 12:00:00'
}

let token = {
  type: 'test',
  token: 'testToken',
  expires_at: '2023-10-10 12:00:00'
}

let user = {
  id: 2,
  email: 'perkins@continental.com',
  name: 'Ms',
  surname: 'Perkins',
  role: 'user',
  password: 'secret',
  remember_me_token: null,
  created_at: '2023-10-11 12:00:00',
  updated_at: '2023-10-11 12:00:00'
}

let testApiService: Partial<ApiService> = {
  getRequest: (clientData: { url: string, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next({ user: user })
  }),
  postRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  }),
  putRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  })
}

describe('UserComponent', () => {
  let component: UserComponent
  let fixture: ComponentFixture<UserComponent>
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>
  let route: ActivatedRoute
  let routeSpy: jasmine.Spy

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [UserComponent, ModalComponent, SpinnerComponent],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'users', component: UsersComponent }
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

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    route = TestBed.inject(ActivatedRoute)
    store = TestBed.inject(Store)

    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(store, 'select').and.callFake(() => of(authUser))
    spyOn(http, 'getRequest').and.callThrough()
    spyOn(http, 'postRequest').and.callThrough()
    spyOn(http, 'putRequest').and.callThrough()
    spyOn(router, 'navigate')
    routeSpy = spyOn(route.snapshot.queryParamMap, 'get')
    routeSpy.and.returnValue('2')

    component.ngOnInit()

    await fixture.whenStable()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should get the authenticated user from store', fakeAsync(() => {
    expect(store.select).toHaveBeenCalled()
    expect(component.authUser).toEqual(authUser)
  }))

  it('should fetch user from api if route has a userId in its query params', fakeAsync(() => {
    expect(component.userId).toBe('2')
    expect(http.getRequest).toHaveBeenCalledWith({ url: 'users/2' })
    expect(component.user).toEqual(user)
  }))

  it('should go to editing mode when route has no authenticated userId in its query params', fakeAsync(() => {
    component.user = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)

    component.ngOnInit()
    fixture.detectChanges()

    expect(component.editing).toBeTrue()
    expect(component.userId).toBeNull()
    expect(component.user).toBeNull()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#user-editing')
    expect(editingSection).toBeTruthy()
  }))

  it('should validate if email format is valid or invalid', fakeAsync(() => {
    component.user = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)

    component.ngOnInit()
    fixture.detectChanges()

    expect(component.editing).toBeTrue()
    expect(component.userId).toBeNull()
    expect(component.user).toBeNull()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#user-editing')
    expect(editingSection).toBeTruthy()

    fixture.whenStable()
    tick()

    component.userForm.controls['email'].setValue('test.company.com')
    expect(component.userForm.controls['email'].status).toBe('INVALID')
    component.userForm.controls['email'].setValue('test@company.com')
    expect(component.userForm.controls['email'].status).toBe('VALID')
  }))

  it('should validate form data to be incorrect to create the new User, and should disable the submit button', fakeAsync(() => {
    component.user = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)

    component.ngOnInit()
    fixture.detectChanges()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#user-editing')
    expect(editingSection).toBeTruthy()

    fixture.detectChanges()
    tick()

    component.userForm.controls['email'].setValue('')
    component.userForm.controls['name'].setValue('')
    component.userForm.controls['surname'].setValue('')
    component.userForm.controls['role'].setValue('')
    component.userForm.controls['password'].setValue('')

    fixture.detectChanges()
    tick()

    expect(component.userForm.controls['email'].status).toBe('INVALID')
    expect(component.userForm.controls['name'].status).toBe('INVALID')
    expect(component.userForm.controls['surname'].status).toBe('INVALID')
    expect(component.userForm.controls['role'].status).toBe('INVALID')
    expect(component.userForm.controls['password'].status).toBe('INVALID')
    expect(component.userForm.status).toBe('INVALID')

    expect(component.editingUser.email).toBe('')
    expect(component.editingUser.name).toBe('')
    expect(component.editingUser.surname).toBe('')
    expect(component.editingUser.role).toBe('')
    expect(component.editingUser.password).toBe('')

    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(submit.disabled).toBeTrue()
  }))

  it('should validate the  form data to be correct to create new ToDo, and should enable the submit button, and finally should then submit the new ToDo', fakeAsync(() => {
    component.user = null
    routeSpy.calls.reset()
    routeSpy.and.returnValue(null)
    component.ngOnInit()
    fixture.detectChanges()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#user-editing')
    expect(editingSection).toBeTruthy()

    fixture.detectChanges()
    tick()

    component.userForm.controls['email'].setValue('jack.tester@company.com')
    component.userForm.controls['name'].setValue('Jack')
    component.userForm.controls['surname'].setValue('Tester')
    component.userForm.controls['role'].setValue('user')
    component.userForm.controls['password'].setValue('test')

    fixture.detectChanges()
    tick()

    expect(component.userForm.controls['email'].status).toBe('VALID')
    expect(component.userForm.controls['name'].status).toBe('VALID')
    expect(component.userForm.controls['surname'].status).toBe('VALID')
    expect(component.userForm.controls['role'].status).toBe('VALID')
    expect(component.userForm.controls['password'].status).toBe('VALID')
    expect(component.userForm.status).toBe('VALID')

    expect(component.editingUser.email).toBe('jack.tester@company.com')
    expect(component.editingUser.name).toBe('Jack')
    expect(component.editingUser.surname).toBe('Tester')
    expect(component.editingUser.role).toBe('user')
    expect(component.editingUser.password).toBe('test')

    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(submit.disabled).toBeFalse()
    submit.click()

    fixture.detectChanges()
    tick()

    expect(http.postRequest).toHaveBeenCalledOnceWith({
      url: 'users',
      body: {
        email: 'jack.tester@company.com',
        name: 'Jack',
        surname: 'Tester',
        role: 'user',
        password: 'test',
        id: null
      }
    })
  }))

  it('should validate form data to update user as correct, and should then enable the submit button, and finally submit the updated user', fakeAsync(() => {
    const editingButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#open-editing')
    expect(editingButton).toBeTruthy()
    editingButton.click()
    fixture.detectChanges()
    tick()

    const editingSection: HTMLElement = fixture.debugElement.nativeElement.querySelector('#user-editing')
    expect(editingSection).toBeTruthy()

    expect(component.editingUser.email).toBe('perkins@continental.com')
    expect(component.editingUser.name).toBe('Ms')
    expect(component.editingUser.surname).toBe('Perkins')
    expect(component.editingUser.role).toBe('user')
    expect(component.editingUser.password).toBe(null)

    fixture.whenStable()
    fixture.detectChanges()
    tick()

    component.userForm.controls['email'].setValue('miss.perkins@continental.com')
    component.userForm.controls['name'].setValue('Miss')
    component.userForm.controls['surname'].setValue('Perkins')
    component.userForm.controls['role'].setValue('admin')
    component.userForm.controls['password'].setValue('test')

    fixture.detectChanges()
    tick()

    expect(component.userForm.controls['email'].status).toBe('VALID')
    expect(component.userForm.controls['name'].status).toBe('VALID')
    expect(component.userForm.controls['surname'].status).toBe('VALID')
    expect(component.userForm.controls['role'].status).toBe('VALID')
    expect(component.userForm.controls['password'].status).toBe('VALID')
    expect(component.userForm.status).toBe('VALID')

    expect(component.editingUser.email).toBe('miss.perkins@continental.com')
    expect(component.editingUser.name).toBe('Miss')
    expect(component.editingUser.surname).toBe('Perkins')
    expect(component.editingUser.role).toBe('admin')
    expect(component.editingUser.password).toBe('test')

    const submit: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#submit')
    expect(submit).toBeTruthy()
    expect(submit.disabled).toBeFalse()
    submit.click()

    fixture.detectChanges()
    tick()

    expect(component.user).toEqual(user)
    expect(http.putRequest).toHaveBeenCalledOnceWith({
      url: 'users/2',
      body: {
        email: 'miss.perkins@continental.com',
        name: 'Miss',
        surname: 'Perkins',
        role: 'admin',
        password: 'test',
        id: Number(component.user?.id)
      }
    })
  }))
})
