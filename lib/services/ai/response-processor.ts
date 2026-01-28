import { AIService, ConversationContext } from './ai-service';
import { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { createAutoReplyMessage, getMessagesByConversation } from '@/features/chat/api/message.api';
import { markConversationAsHandoff } from '@/features/chat/api/conversation.api';
import { getConversationById } from '@/features/chat/api/conversation.api';
import { sendWhatsAppTextMessage } from '@/features/chat/api/send-message.api';

const AGENT_WA_ID = process.env.WA_AGENT_ID || '51918506768';

export interface ProcessMessageParams {
  conversationId: string;
  userMessage: string;
  channelConfig: WebsiteWidgetConfig;
  contactName?: string;
  channel?: string;
  autoSaveReply?: boolean;
}

export interface ProcessMessageResult {
  shouldReply: boolean;
  reply?: string;
  handoffToHuman?: boolean;
  error?: string;
}

export async function processIncomingMessage(
  params: ProcessMessageParams
): Promise<ProcessMessageResult> {
  const { conversationId, userMessage, channelConfig, contactName, channel } = params;

  if (!channelConfig.ai_enabled || !channelConfig.ai_config) {
    return { shouldReply: false };
  }

  const conversation = await getConversationById(conversationId);

  const aiService = await AIService.create(channelConfig.ai_config);
  if (!aiService) {
    return { shouldReply: false };
  }

  const context = await getConversationContext(conversationId, contactName, channel);

  try {
    const response = await aiService.generateResponse(userMessage, context);

    if (!response.content) {
      throw new Error(response.error || 'Respuesta vacía');
    }

    await createAutoReplyMessage(conversationId, response.content);

    //  La IA decide si hay handoff
    if (response.handoffToHuman) {
      await markConversationAsHandoff(conversationId);

      await sendAgentNotification(conversationId, userMessage, 'IA solicitó handoff a humano');
    }

    return {
      shouldReply: true,
      reply: response.content,
      handoffToHuman: response.handoffToHuman,
    };
  } catch (error) {
    console.error(`[AI][${conversationId}] Error`, error);

    const fallback = aiService.getFallbackMessage();
    await createAutoReplyMessage(conversationId, fallback);

    return {
      shouldReply: true,
      reply: fallback,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getConversationContext(
  conversationId: string,
  contactName?: string,
  channel?: string
): Promise<ConversationContext> {
  try {
    const messages = await getMessagesByConversation(conversationId);
    return { messages, contactName, channel };
  } catch {
    return { messages: [] };
  }
}

async function sendAgentNotification(
  conversationId: string,
  message: string,
  reason: string
): Promise<void> {
  const notification = `${reason} | Conversación ${conversationId} | "${message}"`;
  await sendWhatsAppTextMessage({ to: AGENT_WA_ID, message: notification });
}
