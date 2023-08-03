import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpResponse } from "@angular/common/http";
import { HttpRequest } from "@angular/common/http";
import { Observable, first, mergeMap, tap } from 'rxjs';
import { Store } from "@ngrx/store";
import { selectUserToken } from './../state/index';
import { Token } from '../types';
import { Router } from "@angular/router";
import { logout } from "../state/actions/user.actions";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private store: Store, private router: Router) { }

    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {
        return this.store.select(selectUserToken).pipe(
            first(),
            mergeMap((tokenData: Token | null) => {
                const authReq = !!tokenData ? req.clone({
                    setHeaders: { Authorization: 'Bearer ' + tokenData.token },
                }) : req;
                return next.handle(authReq).pipe(
                    tap({
                        next: (event) => {
                            if (event instanceof HttpResponse) {
                                if (event.status == 401) {
                                    this.store.dispatch(logout())
                                    localStorage.clear()
                                    this.router.navigate(['/login'], { queryParams: { noAuth: 1 } })
                                }
                            }
                            return event;
                        },
                        error: (error) => {
                            if (error.status === 401) {
                                this.store.dispatch(logout())
                                localStorage.clear()
                                this.router.navigate(['/login'], { queryParams: { noAuth: 1 } })
                            } else if (error.status === 404)
                                console.error('Page Not Found!')
                        }
                    }))
            }),
        )
    }
}