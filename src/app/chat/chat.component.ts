import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatbotService } from '../services/chatbot.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { studyPrograms } from '../utils/study_programs';

export interface ChatMessage {
  message: string;
  type: string;
}

export const welcomeMessage = `
Welcome to the TUM Academic Advisor Chatbot!

I'm here to help you with detailed and accurate information about your studies at the TUM School of Computation, Information and Technology. Whether you have questions about your courses, exams, or study plans, feel free to ask!

If you'd like program-specific advice, please select your study program from the dropdown menu at the top, and I'll provide you with the most relevant information.
`;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, ReactiveFormsModule],
  providers: [ChatbotService],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollAnchor', { static: false }) scrollAnchor: ElementRef | undefined;
  messages: ChatMessage[] = [];
  userMessage: string = '';

  // FormControl for the study program dropdown
  studyProgramControl = new FormControl('');
  studyPrograms = studyPrograms;

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit() {
    this.messages.push({ message: welcomeMessage, type: 'system' });
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ message: this.userMessage, type: 'user' });
      this.userMessage = '';

      const selectedProgram = this.studyProgramControl.value as string;
      this.chatbotService.getBotResponse(this.messages, selectedProgram).subscribe((response: any) => {
        this.messages.push({ message: response.answer, type: 'system' });
        this.scrollToBottom();
      });
    }
    this.scrollToBottom();
  }

  protected scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollAnchor) {
        this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', inline: 'end' });
      }
    }, 0);
  }
}
