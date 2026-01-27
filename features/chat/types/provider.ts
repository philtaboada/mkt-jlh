import { Contact } from './conversation';
import { MessageTemplate } from './template';

export interface SendMessagePayload {
  conversationId: string;
  contact: Contact;
  content?: string;
  attachments?: File[];
  template?: {
    template: MessageTemplate;
    params: Record<string, string>;
  };
  sender: {
    id: string;
    type: 'agent' | 'user';
  };
}

export interface MessageProvider {
  send(payload: SendMessagePayload): Promise<void>;
}
