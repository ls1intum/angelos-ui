import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, ViewChildren, QueryList, AfterViewChecked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatbotService } from '../services/chatbot.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { studyPrograms } from '../utils/study_programs';
import { ActivatedRoute } from '@angular/router';

export interface ChatMessage {
  message: string;
  type: string;
}

export const MESSAGES = {
  en: {
    welcomeMessage: `
      Welcome to the TUM Academic Advisor Chatbot!
      
      I'm here to help you with detailed and accurate information about your studies at the TUM School of Computation, Information and Technology. Whether you have questions about your courses, exams, or study plans, feel free to ask!
      
      If you'd like program-specific advice, please select your study program from the dropdown menu at the top, and I'll provide you with the most relevant information.
    `,
    errorMessage: `Sorry, but I am currently unable to answer your questions. Please try again at a later time.`,
    placeholder: `Type your message here...`
  },
  de: {
    welcomeMessage: `
      Willkommen beim TUM Academic Advisor Chatbot!
      
      Ich bin hier, um Ihnen mit detaillierten und genauen Informationen zu Ihrem Studium an der TUM School of Computation, Information and Technology zu helfen. Egal ob Sie Fragen zu Kursen, Prüfungen oder Studienplänen haben, zögern Sie nicht zu fragen!
      
      Wenn Sie studiengangspezifische Ratschläge benötigen, wählen Sie bitte Ihr Studienprogramm aus dem Dropdown-Menü oben, und ich werde Ihnen die relevantesten Informationen bereitstellen.
    `,
    errorMessage: `Entschuldigung, aber ich kann Ihre Fragen derzeit nicht beantworten. Bitte versuchen Sie es später erneut.`,
    placeholder: `Geben Sie hier Ihre Nachricht ein...`
  }
};

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, ReactiveFormsModule],
  providers: [ChatbotService],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBody', { static: false }) chatBody: ElementRef | undefined;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChildren('messageElements') messageElements!: QueryList<ElementRef>;

  messages: ChatMessage[] = [];
  userMessage: string = '';
  placeholderText: string = '';
  welcomeMessage: string = '';
  errorMessage: string = '';

  // FormControl for the study program dropdown
  studyProgramControl = new FormControl('');
  studyPrograms = studyPrograms;

  language: 'en' | 'de' = 'en'; // Default language is English
  private needScrollToBottom: boolean = false;

  constructor(private chatbotService: ChatbotService, private route: ActivatedRoute) { }

  ngOnInit() {
    // Get language from route data (or query params if applicable)
    this.route.data.subscribe(data => {
      this.language = data['language'] || 'en';
      this.setLanguageContent();
    });
    this.messages.push({ message: this.welcomeMessage, type: 'system' });
  }

  ngAfterViewChecked() {
    if (this.needScrollToBottom) {
      this.scrollToBottom();
      this.needScrollToBottom = false;
    }
  }

  setLanguageContent() {
    this.welcomeMessage = MESSAGES[this.language].welcomeMessage;
    this.errorMessage = MESSAGES[this.language].errorMessage;
    this.placeholderText = MESSAGES[this.language].placeholder;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault(); // Prevents the default action of adding a newline
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      // Add the user's message to the messages array
      this.messages.push({ message: this.userMessage, type: 'user' });
      this.userMessage = '';
      this.resetTextAreaHeight();
      this.needScrollToBottom = true;
  
      const selectedProgram = this.studyProgramControl.value as string;
  
      // Add a loading message to indicate the bot is typing
      const loadingMessage: ChatMessage = { message: '', type: 'loading' };
      this.messages.push(loadingMessage);
      this.needScrollToBottom = true;
  
      // Prepare the messages to send to the bot, excluding the loading message
      const messagesToSend = this.messages.filter(msg => msg.type !== 'loading');
  
      // Call the bot service with the filtered messages
      this.chatbotService.getBotResponse(messagesToSend, selectedProgram).subscribe({
        next: (response: any) => {
          // Remove the loading message
          this.messages.pop();
          // Add the bot's response
          const formattedResponse = this.formatResponseText(response.answer);
          this.messages.push({ message: formattedResponse, type: 'system' });
          this.needScrollToBottom = true;
        },
        error: (error) => {
          console.error('Error fetching response:', error);
          // Remove the loading message
          this.messages.pop();
          // Add an error message
          this.messages.push({
            message: this.errorMessage,
            type: 'system'
          });
          this.needScrollToBottom = true;
        }
      });
    }
  }

  formatResponseText(text: string): string {
    const withLineBreaks = text.replace(/(\d+\.\s*\*\*.*?\*\*)/g, '<br>$1');
    const boldFormatted = withLineBreaks.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const linkFormatted = boldFormatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="system-link">$1</a>');
    return linkFormatted;
  }

  adjustTextAreaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    // Reset height to calculate new height correctly
    textarea.style.height = 'auto';

    const computed = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computed.lineHeight);
    const paddingTop = parseFloat(computed.paddingTop);
    const paddingBottom = parseFloat(computed.paddingBottom);
    const borderTop = parseFloat(computed.borderTopWidth);
    const borderBottom = parseFloat(computed.borderBottomWidth);

    // Calculate the maximum height (4 lines of text)
    const maxHeight = (lineHeight * 4) + paddingTop + paddingBottom + borderTop + borderBottom;

    // Calculate the new height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    // Set the new height
    textarea.style.height = `${newHeight}px`;

    // Handle overflow
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
  }

  resetTextAreaHeight(): void {
    if (this.messageInput) {
      const textarea = this.messageInput.nativeElement as HTMLTextAreaElement;
  
      // Reset the height back to a single line
      const computed = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computed.lineHeight);
      const paddingTop = parseFloat(computed.paddingTop);
      const paddingBottom = parseFloat(computed.paddingBottom);
      const borderTop = parseFloat(computed.borderTopWidth);
      const borderBottom = parseFloat(computed.borderBottomWidth);
  
      const singleLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
  
      textarea.style.height = `${singleLineHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  }

  protected scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageElements && this.chatBody && this.messageElements.length > 0) {
        console.log("Scrolling down")
        const lastMessageElement = this.messageElements.last;
        lastMessageElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

        setTimeout(() => {
          this.chatBody!.nativeElement.scrollTop += 12;
        }, 500);
      }
    }, 0);
  }
}
