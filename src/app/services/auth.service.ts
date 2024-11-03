import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(): Observable<AuthResponse> {
    const headers = new HttpHeaders().set('x-api-key', environment.angelosAppApiKey);
    if (environment.angelosAppApiKey.length === 0) {
      console.log('Please provide a valid API key');
    } else {
      console.log(environment.angelosAppApiKey.at(0));
    }

    return this.http.post<AuthResponse>(environment.angelosToken, {}, { headers }).pipe(
      tap((response: AuthResponse) => {
        sessionStorage.setItem('access_token', response.access_token);
      })
    );
  }

  // Method to retrieve the stored token
  public getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }
}
