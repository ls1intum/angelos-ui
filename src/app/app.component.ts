import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ChatbotService } from './services/chatbot.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent, HttpClientModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angelos-ui';
}
