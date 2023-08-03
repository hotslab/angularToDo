import { createReducer, on } from '@ngrx/store';
import * as userActions from '../actions/user.actions';
import { User, Token } from 'src/app/types';

function getUserData(): {
    user: User | null
    token: Token | null
    notifications: number
} {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : { user: null, token: null, notifications: 0 }
}


export interface State {
    user: User | null
    token: Token | null,
    notifications: number
}

export const initialState: State = {
    user: (getUserData()).user,
    token: (getUserData()).token,
    notifications: (getUserData()).notifications,
}

export const userReducer = createReducer(
    initialState,
    on(userActions.login, (state, { user, token }) => ({ ...state, user: user, token })),
    on(userActions.register, (state, { user, token }) => ({ ...state, user, token })),
    on(userActions.logout, (state) => (state = { user: null, token: null, notifications: 0 })),
    on(userActions.addNotifications, (state, { notifications }) => (state = { ...state, notifications: notifications })),
    on(userActions.removeNotifications, (state) => (state = { ...state, notifications: 0 })),
)

export const userInfo = (state: State) => state.user

export const userToken = (state: State) => state.token

export const userNotifications = (state: State) => state.notifications
