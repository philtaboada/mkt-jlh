export type SenderType = 'user' | 'agent' | 'bot' | 'system';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file';

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
