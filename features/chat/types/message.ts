import { InstagramSendRequest } from '../api/providers/instagram';
import { MessengerSendRequest } from '../api/providers/messenger';
import { WhatsAppSendRequest } from '../api/providers/whatsapp';

export type SenderType = 'user' | 'agent' | 'bot' | 'system';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file';
export type ChannelType = 'whatsapp' | 'messenger' | 'instagram' | 'telegram' | 'webchat' | 'email';
export type StatusMessage = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type Message = {
  id?: string;
  conversation_id: string;
  sender_type?: SenderType;
  sender_id: string;
  type?: MessageType;
  body?: string;
  media_url?: string;
  media_mime?: string;
  media_size?: number;
  media_name?: string;
  metadata?: Record<string, any>;
  provider?: string;
  external_id?: string;
  status?: string;
  created_at?: Date;
  read_at?: Date | null;
};

export interface UpdateStatusMessage {
  provider: string;
  external_id: string;
  status: string;
  read_at?: Date;
}

export type SendWhatsappVars = {
  conversationId: string;
  sendRequest: WhatsAppSendRequest;
  dbData: {
    sender_id: string;
    sender_type: 'agent' | 'user';
    body?: string;
    type?: Message['type'];
    media_url?: string;
    media_name?: string;
    media_mime?: string;
    media_size?: number;
    metadata?: Record<string, any>;
  };
};

export type SendMessengerVars = {
  conversationId: string;

  sendRequest: MessengerSendRequest;
  dbData: {
    sender_id: string;
    sender_type: 'agent' | 'user';
    body?: string;
    type?: Message['type'];
    media_url?: string;
    media_name?: string;
    media_mime?: string;
    media_size?: number;
    metadata?: Record<string, any>;
  };
};

export type SendInstagramVars = {
  conversationId: string;
  instagramBusinessId: string;
  sendRequest: InstagramSendRequest;
  dbData: {
    sender_id: string;
    sender_type: 'agent' | 'user';
    body?: string;
    type?: Message['type'];
    media_url?: string;
    media_name?: string;
    media_mime?: string;
    media_size?: number;
    metadata?: Record<string, any>;
  };
};
