import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor } from "@angular/common/http";
import { HttpRequest } from "@angular/common/http";
import { Observable, first, mergeMap } from 'rxjs';
import { Store } from "@ngrx/store";
import { selectUserToken } from './../state/index';
import { Token } from '../types';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private store: Store) { }

    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {
        return this.store.select(selectUserToken).pipe(
            first(),
            mergeMap((tokenData: Token | null) => {
                const authReq = !!tokenData ? req.clone({
                    setHeaders: { Authorization: 'Bearer ' + tokenData.token },
                }) : req;
                return next.handle(authReq)
            }),
        )
    }
}