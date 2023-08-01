import { isDevMode } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token'
    })
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    apiUrl: string = ''
    constructor(private httpClient: HttpClient) {
        this.apiUrl = isDevMode() ? ' http://127.0.0.1:3333/api/' : ''
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error(error.error));
    }

    public getRequest(clientData: { url: string, options?: any }): Observable<any> {
        return this.httpClient.get<any>(`${this.apiUrl}${clientData.url}`, clientData.options)
            .pipe(catchError(this.handleError))
    }
    public postRequest(clientData: { url: string, body: any, options?: any }): Observable<any> {
        return this.httpClient.post<any>(`${this.apiUrl}${clientData.url}`, clientData.body, clientData.options)
            .pipe(catchError(this.handleError))
    }
    public putRequest(clientData: { url: string, body: any, options?: any }): Observable<any> {
        return this.httpClient.put<any>(`${this.apiUrl}${clientData.url}`, clientData.body, clientData.options)
            .pipe(catchError(this.handleError))
    }
    public patchRequest(clientData: { url: string, body: any, options?: any }): Observable<any> {
        return this.httpClient.patch<any>(`${this.apiUrl}${clientData.url}`, clientData.body, clientData.options)
            .pipe(catchError(this.handleError))
    }
    public deleteRequest(clientData: { url: string, options?: any }): Observable<any> {
        return this.httpClient.delete<any>(`${this.apiUrl}${clientData.url}`, clientData.options);
    }
}