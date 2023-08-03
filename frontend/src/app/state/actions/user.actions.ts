import { createAction, props } from '@ngrx/store';
import { User, Token } from 'src/app/types';

export const login = createAction(
    '[Login Page] Login',
    props<{ user: User; token: Token }>()
)

export const register = createAction(
    '[Register Page] Register',
    props<{ user: User; token: Token }>()
)

export const logout = createAction(
    '[Logout Button] Logout'
)

export const addNotifications = createAction(
    '[Root Page] AddNotifications',
    props<{ notifications: number }>()
)

export const removeNotifications = createAction(
    '[Notification Page] RemoveNotifications'
)