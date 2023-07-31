import { Action, createReducer, on } from '@ngrx/store';
import * as userActions from '../actions/user.actions';
import { User, Token } from 'src/app/types';

function getUserData(): { user: User | null, token: Token | null } {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : { user: null, token: null }
}


export interface State {
    user: User | null
    token: Token | null
}

export const initialState: State = {
    user: (getUserData()).user,
    token: (getUserData()).token
}

export const userReducer = createReducer(
    initialState,
    on(userActions.login, (state, { user, token }) => ({ user, token })),
    on(userActions.register, (state, { user, token }) => ({ user, token })),
    on(userActions.logout, (state) => (state = { user: null, token: null })),
)

export const userInfo = (state: State) => state.user

export const userToken = (state: State) => state.token
