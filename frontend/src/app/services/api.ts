import { isDevMode } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
        this.apiUrl = environment.apiUrl
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An internal server error occured. Please try again.'
        if (error.status !== 500) {
            if (typeof error.error === 'string')
                errorMessage = error.error
            else if (error.error instanceof Object && error.error.constructor === Object) {
                if (error.error.hasOwnProperty('message')) errorMessage = error.error.message
                else {
                    let errorText = ''
                    for (const [key, value] of Object.entries(error.error)) errorText += `${key}: ${value}, `
                    errorMessage = errorText.trim().slice(0, -1)
                }
            }
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error(errorMessage))
    }

    /** Get request handler */
    public getRequest(clientData: { url: string, options?: any }): Observable<any> {
        return this.httpClient.get<any>(`${this.apiUrl}${clientData.url}`, clientData.options)
            .pipe(catchError(this.handleError))
    }
    /** Post request handler */
    public postRequest(clientData: { url: string, body: any, options?: any }): Observable<any> {
        return this.httpClient.post<any>(`${this.apiUrl}${clientData.url}`, clientData.body, clientData.options)
            .pipe(catchError(this.handleError))
    }
    /** Put request handler */
    public putRequest(clientData: { url: string, body: any, options?: any }): Observable<any> {
        return this.httpClient.put<any>(`${this.apiUrl}${clientData.url}`, clientData.body, clientData.options)
            .pipe(catchError(this.handleError))
    }
    /** Patch request handler */
    public patchRequest(clientData: { url: string, body: any, options?: any }): Observable<any> {
        return this.httpClient.patch<any>(`${this.apiUrl}${clientData.url}`, clientData.body, clientData.options)
            .pipe(catchError(this.handleError))
    }
    /** Delete request handler */
    public deleteRequest(clientData: { url: string, options?: any }): Observable<any> {
        return this.httpClient.delete<any>(`${this.apiUrl}${clientData.url}`, clientData.options);
    }
}