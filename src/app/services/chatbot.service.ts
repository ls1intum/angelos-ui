import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatMessage } from '../chat/chat.component';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendBotRequest(token: string | null, chatHistory: ChatMessage[], study_program: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(environment.angelosUrl,
      { messages: chatHistory, study_program: study_program },
      { headers }
    );
  }

  getBotResponse(chatHistory: ChatMessage[], study_program: string): Observable<any> {
    const token = this.authService.getToken();

    const makeRequest = (authToken: string): Observable<any> => {
      return this.sendBotRequest(authToken, chatHistory, study_program);
    };

    if (token) {
      return makeRequest(token).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            // Token might have expired, try to re-authenticate
            return this.authService.login().pipe(
              switchMap(() => {
                const newToken = this.authService.getToken();
                if (newToken) {
                  return makeRequest(newToken);
                } else {
                  // Login failed to return a token
                  return throwError(() => new Error('Failed to obtain new token after re-authentication.'));
                }
              }),
              catchError(loginError => {
                // Handle login failure
                return throwError(() => loginError);
              })
            );
          } else {
            // Other errors
            return throwError(() => error);
          }
        })
      );
    } else {
      // No token available, attempt to login
      return this.authService.login().pipe(
        switchMap(() => {
          const newToken = this.authService.getToken();
          if (newToken) {
            return makeRequest(newToken);
          } else {
            // Login failed to return a token
            return throwError(() => new Error('Failed to obtain token after login.'));
          }
        }),
        catchError(loginError => {
          // Handle login failure
          return throwError(() => loginError);
        })
      );
    }
  }
}
