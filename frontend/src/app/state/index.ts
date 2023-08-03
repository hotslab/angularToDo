import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import * as userStore from './reducers/user.reducer';
import { localStorageSync } from 'ngrx-store-localstorage';

export interface State {
  userData: userStore.State
}

export const reducers: ActionReducerMap<State> = {
  userData: userStore.userReducer
}

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({ keys: ['userData'] })(reducer)
}

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state', state)
    console.log('action', action)
    return reducer(state, action)
  }
}

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [debug, localStorageSyncReducer] : [localStorageSyncReducer]

export const selectUser = createFeatureSelector<userStore.State>('userData')

export const selectUserData = createSelector(
  selectUser,
  userStore.userInfo
)

export const selectUserToken = createSelector(
  selectUser,
  userStore.userToken
)

export const selectUserNotifications = createSelector(
  selectUser,
  userStore.userNotifications
)
