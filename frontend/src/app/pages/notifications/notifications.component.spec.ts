import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { NotificationsComponent } from './notifications.component';
import { TodoComponent } from '../todo/todo.component';
import { SpinnerComponent } from 'src/app/component/spinner/spinner.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import * as fromRoot from '../../state';
import * as fromFeature from '../../state/reducers/user.reducer';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { Observable, of } from 'rxjs';

let user = {
  id: 1,
  email: 'test@company.com',
  name: 'test',
  surname: 'company',
  password: 'test',
  role: 'user',
  remember_me_token: null,
  created_at: '2023-10-09 12:00:00',
  updated_at: '2023-10-09 12:00:00'

}

let token = {
  type: 'test',
  token: 'testToken',
  expires_at: '2023-10-10 12:00:00'
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
  getRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next({ notifications: notifications })
  }),
  putRequest: (clientData: { url: string, body: any, options?: any }): Observable<any> => new Observable((subscriber) => {
    subscriber.next()
  })
}

describe('NotificationsComponent', () => {
  let component: NotificationsComponent
  let fixture: ComponentFixture<NotificationsComponent>
  let http: ApiService
  let router: Router
  let store: Store<fromFeature.State>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [NotificationsComponent, SpinnerComponent],
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

    fixture = TestBed.createComponent(NotificationsComponent)
    component = fixture.componentInstance

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
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  })

  it('should get the authenticated user from store', fakeAsync(() => {
    expect(store.select).toHaveBeenCalled()
    expect(component.user).toEqual(user)
  }))

  it('should get the notifications of the user from the api', fakeAsync(() => {
    expect(http.getRequest)
      .toHaveBeenCalledWith({ url: 'notifications', options: { params: { userId: user.id } } })
    expect(component.notifications).toEqual(notifications)

    const notificationsElement: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#notifications')
    expect(notificationsElement).toBeTruthy()
  }))

  it('should be able to go to a selected ToDo when its view button is clicked as well as closing the notification', fakeAsync(() => {
    spyOn(http, 'putRequest').and.callThrough()
    const view: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('#view')
    expect(view).toBeTruthy()
    console.log(view)
    view.click()
    expect(http.putRequest).toHaveBeenCalledWith({ url: 'notifications/1', body: {} })
    expect(router.navigate).toHaveBeenCalledOnceWith(['/todo'], { queryParams: { id: 1 } })
  }))
})
