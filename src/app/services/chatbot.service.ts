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
  private url = environment.angelosUrl;
  private orgId: number = environment.organisation;
  private filterByOrg: boolean = environment.filterByOrg;

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendBotRequest(token: string | null, chatHistory: ChatMessage[], study_program: string): Observable<any> {
    const headers = new HttpHeaders().set('ChatAuth', `Bearer ${token}`);
    
    return this.http.post(
      `${this.url}/send?filterByOrg=${this.filterByOrg}`,
      {
        messages: chatHistory,
        study_program: study_program,
        orgId: this.orgId
      },
      { headers }
    );
  }

  getBotResponse(chatHistory: ChatMessage[], study_program: string): Observable<any> {
    const token = this.authService.getToken();
    if (false && token) {
      return this.sendBotRequest(token, chatHistory, study_program);
    } else {
      throw new Error('No token found. Access should have been restricted by AuthGuard.');
    }
  }
}
