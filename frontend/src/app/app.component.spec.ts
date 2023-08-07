import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AppComponent } from './app.component';
import { ModalComponent } from 'src/app/component/modal/modal.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as fromRoot from './state';
import * as fromFeature from './state/reducers/user.reducer';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { Observable, of } from 'rxjs';

let manager = {
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

let notifications = [
  {
    id: 1,
    title: 'Test Todo',
    status: 'due',
    viewed: 0,
    dueDate: '2023-10-10 10:25:00',
    user_id: 1,
    to_do_id: 1,
  },
  {
    id: 2,
    title: 'Another Test Todo2',
    status: 'overdue',
    viewed: 0,
    dueDate: '2023-10-10 10:00:00',
    user_id: 1,
    to_do_id: 2,
  }
]

let testApiService: Partial<ApiService> = {
  getRequest: (clientData: { url: string, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next({ notifications: notifications })
  })
}

let testStore: Partial<Store> = {
  select: (value: any): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  }),
  dispatch: (action: any): void => { }
}

describe('AppComponent', () => {
  let component: AppComponent
  let fixture: ComponentFixture<AppComponent>
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>
  let storeSpy: jasmine.Spy

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, ModalComponent],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([]),
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromFeature.userReducer),
        }),
      ],
      providers: [
        { provide: ApiService, useValue: testApiService },
        { provide: Store, useValue: testStore },
      ],
    })

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance

    http = TestBed.inject(ApiService)
    router = TestBed.inject(Router)
    store = TestBed.inject(Store)

    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(store, 'dispatch').and.callThrough()
    spyOn(http, 'getRequest').and.callThrough()
    spyOn(router, 'navigate')
    storeSpy = spyOn(store, 'select')
  })

  it('should create the app', async () => {
    storeSpy.and.returnValues(of(manager), of(token), of(notifications.length))
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should get authenticated user details and notifications', async () => {
    storeSpy.and.returnValues(of(manager), of(token), of(notifications.length))
    fixture.detectChanges()
    expect(component.user).toEqual(manager)
    expect(component.tokenData).toEqual(token)
    expect(component.user).toEqual(manager)
    expect(http.getRequest)
      .toHaveBeenCalledWith({
        url: 'notifications', options: {
          params: { userId: component.user?.id }
        }
      })
    expect(store.dispatch).toHaveBeenCalled()
  })

  it('should logout authenticated user', async () => {
    storeSpy.and.returnValues(of(manager), of(token), of(notifications.length))
    fixture.detectChanges()
    expect(component.user).toEqual(manager)
    expect(component.tokenData).toEqual(token)
    const logoutButton: HTMLLinkElement = fixture.debugElement.nativeElement.querySelector('#logout')
    expect(logoutButton.textContent?.trim()).toEqual('Logout')
    logoutButton.click()
    expect(router.navigate).toHaveBeenCalledWith(['/'])
  })
})
