import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatMessage } from '../chat/chat.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private http: HttpClient) { }

  getBotResponse(chatHistory: ChatMessage[], study_program: string): Observable<any> {
    return this.http.post('http://localhost:8000/api/v1/question/chat', { messages: chatHistory, study_program: study_program });
  }
}
