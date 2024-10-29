import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: 'chat/en', component: ChatComponent, data: { language: 'en' } },
  { path: 'chat/de', component: ChatComponent, data: { language: 'de' } },
  { path: '', redirectTo: 'chat/en', pathMatch: 'full' } // Default to English chat
];