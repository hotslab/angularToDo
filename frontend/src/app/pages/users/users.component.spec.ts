import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { UserComponent } from '../user/user.component';
import { ModalComponent } from 'src/app/component/modal/modal.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as fromRoot from '../../state';
import * as fromFeature from '../../state/reducers/user.reducer';
import { ApiService } from 'src/app/services/api';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';


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

let users = [
  {
    id: 2,
    email: 'perkins@continental.com',
    name: 'Ms',
    surname: 'Perkins',
    role: 'user',
    password: 'secret'
  },
  {
    id: 3,
    email: 'john.wick@continental.com',
    name: 'John',
    surname: 'Wick',
    role: 'user',
    password: 'boogeyman'
  }
]

let testApiService: Partial<ApiService> = {
  getRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next({ users: users })
  }),
  deleteRequest: (clientData: { url: string, body?: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  })
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [UsersComponent, ModalComponent],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'user', component: UserComponent }
        ]),
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromFeature.userReducer),
        }),
      ],
      providers: [
        { provide: ApiService, useValue: testApiService },
      ],
    });
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    store = TestBed.inject(Store)
    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(store, 'select').and.callFake(() => of(authUser))
    spyOn(http, 'getRequest').and.callThrough()
    spyOn(router, 'navigate')
    component.ngOnInit()
    await fixture.whenStable()
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should get the authenticated user from store', fakeAsync(() => {
    expect(store.select).toHaveBeenCalled()
    expect(component.user).toEqual(authUser)
  }))

  it('should get the users from api', fakeAsync(() => {
    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'users', options: {
          params: {
            role: 'user',
            order: 'desc'
          }
        }
      })
    expect(component.users).toEqual(users)
  }))

  it('should be able to do a search with updated search parameters', fakeAsync(() => {
    const email: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email')
    const name: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#name')
    const surname: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#surname')
    const role: HTMLSelectElement = fixture.debugElement.nativeElement.querySelector('#role')
    const order: HTMLSelectElement = fixture.debugElement.nativeElement.querySelector('#order')

    email.value = 'perkins@continental.com'
    email.dispatchEvent(new Event('input'))
    name.value = 'Ms'
    name.dispatchEvent(new Event('input'))
    surname.value = 'Perkins'
    surname.dispatchEvent(new Event('input'))
    role.value = 'admin'
    role.dispatchEvent(new Event('change'))
    console.log(order)
    order.value = 'asc'
    order.dispatchEvent(new Event('change'))

    expect(component.email).toBe('perkins@continental.com')
    expect(component.name).toBe('Ms')
    expect(component.surname).toBe('Perkins')
    expect(component.role).toBe('admin')
    expect(component.order).toBe('asc')
    console.log(component.order, component.role)

    const search: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#search')
    search.click()

    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'users', options: {
          params: {
            email: 'perkins@continental.com',
            name: 'Ms',
            surname: 'Perkins',
            role: 'admin',
            order: 'asc',
          }
        }
      })
    expect(component.users).toEqual(users)
  }))

  it('should be able to go to a selected user when their view button is clicked', fakeAsync(() => {
    spyOn(component, 'goToUser').and.callThrough()
    const view: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#view')
    expect(view).toBeTruthy()
    view.click()
    expect(component.goToUser).toHaveBeenCalled()
    expect(component.selectedUser).toBeNull()
    expect(router.navigate).toHaveBeenCalledOnceWith(['/user'], { queryParams: { id: 2 } })
  }))

  it('should show delete modal before deleting selected ToDo and then delete the ToDo', fakeAsync(() => {
    spyOn(http, 'deleteRequest').and.callThrough()
    const deleteToDo: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#delete')
    deleteToDo.click()

    fixture.whenStable()
    fixture.detectChanges()

    expect(component.selectedUser).toBeTruthy()
    const deleteModal: HTMLElement = fixture.debugElement.nativeElement.querySelector('#delete-modal')
    expect(deleteModal).toBeTruthy()
    const confirmDelete: HTMLElement = fixture.debugElement.nativeElement.querySelector('#confirm-delete')
    expect(confirmDelete).toBeTruthy()
    confirmDelete.click()

    expect(http.deleteRequest).toHaveBeenCalledWith({ url: 'users/2' })
    expect(component.selectedUser).toBeNull()
    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'users', options: {
          params: {
            role: 'user',
            order: 'desc'
          }
        }
      })
    expect(component.users).toEqual(users)
  }))
})
