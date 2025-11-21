import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Conversation {
  id: string;
  contact_id: string;
  channel: string;
  status: string;
  assigned_to?: string;
  last_message_at?: string;
  contact?: {
    id: string;
    name: string;
    wa_id: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_id: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  body?: string;
  media_url?: string;
  media_mime?: string;
  media_size?: number;
  media_name?: string;
  metadata?: any;
  created_at: string;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, data: any) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      loading: false,
      error: null,

      fetchConversations: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement API call
          const response = await fetch('/api/conversations');
          const conversations = await response.json();
          set({ conversations, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch conversations', loading: false });
        }
      },

      selectConversation: (conversation) => {
        set({ currentConversation: conversation });
        get().fetchMessages(conversation.id);
      },

      fetchMessages: async (conversationId) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement API call
          const response = await fetch(`/api/conversations/${conversationId}/messages`);
          const messages = await response.json();
          set({ messages, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch messages', loading: false });
        }
      },

      sendMessage: async (conversationId, data) => {
        try {
          // TODO: Implement API call
          await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify(data),
          });
          // Refresh messages
          get().fetchMessages(conversationId);
        } catch (error) {
          set({ error: 'Failed to send message' });
        }
      },

      markAsRead: async (conversationId) => {
        try {
          // TODO: Implement API call
          await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' });
        } catch (error) {
          console.error('Failed to mark as read');
        }
      },
    }),
    { name: 'chat-store' }
  )
);