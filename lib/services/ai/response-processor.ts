import { AIService, ConversationContext } from './ai-service';
import { AIConfig, WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { createAutoReplyMessage, getMessagesByConversation } from '@/features/chat/api/message.api';
import { markConversationAsHandoff } from '@/features/chat/api/conversation.api';
import { getConversationById } from '@/features/chat/api/conversation.api';
import { sendWhatsAppTextMessage } from '@/features/chat/api/send-message.api';
import { CONTACT_KEYWORDS } from './ai-utils';

const AGENT_WA_ID = '51918506768';

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
  const {
    conversationId,
    userMessage,
    channelConfig,
    contactName,
    channel,
    autoSaveReply = channel === 'website',
  } = params;

  if (!channelConfig.ai_enabled || !channelConfig.ai_config) {
    return { shouldReply: false };
  }

  const aiConfig = channelConfig.ai_config;

  if (aiConfig.response_mode === 'agent_only') {
    return { shouldReply: false };
  }

  const conversation = await getConversationById(conversationId);
  const { status: conversationStatus, ia_enabled } = conversation;

  if (!ia_enabled) {
    console.log('AI: IA no habilitada para esta conversación');
    return { shouldReply: false };
  }

  console.log('AI: IA habilitada, procesando conversación');

  const aiService = await AIService.create(aiConfig);

  if (!aiService) {
    return { shouldReply: false };
  }

  if (aiService.shouldHandoffToHuman(userMessage)) {
    const handoffMessage =
      'Entiendo que prefieres hablar con un agente humano. Transfiriendo tu conversación...';

    if (autoSaveReply) {
      await saveAndNotifyReply(conversationId, handoffMessage, aiConfig);
      await markConversationAsHandoff(conversationId);
    }

    // Send WhatsApp notification to agent
    await sendAgentNotification(
      conversationId,
      userMessage,
      'Usuario solicita hablar con un agente'
    );

    return {
      shouldReply: true,
      reply: handoffMessage,
      handoffToHuman: true,
    };
  }

  if (!aiService.shouldAutoReply()) {
    return { shouldReply: false };
  }

  const context = await getConversationContext(conversationId, contactName, channel);

  try {
    const delay = aiService.getAutoReplyDelay();
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const response = await aiService.generateResponse(userMessage, context);

    if (response.error || !response.content) {
      const fallback = aiService.getFallbackMessage();

      if (autoSaveReply) {
        await saveAndNotifyReply(conversationId, fallback, aiConfig);
      }

      return {
        shouldReply: true,
        reply: fallback,
        error: response.error,
      };
    }

    if (autoSaveReply) {
      await saveAndNotifyReply(conversationId, response.content, aiConfig);
    }

    const needsHandoff = CONTACT_KEYWORDS.some((keyword) =>
      response.content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (needsHandoff) {
      await sendAgentNotification(
        conversationId,
        response.content,
        'La IA ha respondido indicando contacto con asesor'
      );
    }

    return {
      shouldReply: true,
      reply: response.content,
    };
  } catch (error) {
    console.error('Error generating AI response:', error);

    const fallback = aiService.getFallbackMessage();

    if (autoSaveReply) {
      await saveAndNotifyReply(conversationId, fallback, aiConfig);
    }

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
    return {
      messages,
      contactName,
      channel,
    };
  } catch (error) {
    console.error('Error getting conversation context:', error);
    return { messages: [] };
  }
}

async function saveAndNotifyReply(
  conversationId: string,
  reply: string,
  _aiConfig: AIConfig
): Promise<void> {
  try {
    await createAutoReplyMessage(conversationId, reply);
  } catch (error) {
    console.error('Error saving AI reply:', error);
    throw error;
  }
}

async function sendAgentNotification(
  conversationId: string,
  message: string,
  reason: string
): Promise<void> {
  try {
    const notificationMessage = `${reason} en conversación ${conversationId}. Mensaje: "${message}". Revisa el dashboard.`;
    await sendWhatsAppTextMessage({ to: AGENT_WA_ID, message: notificationMessage });
    console.log(`AI: Notificación enviada al agente via WhatsApp: ${reason}`);
  } catch (error) {
    console.error('AI: Error enviando notificación al agente:', error);
  }
}

export function isAIEnabledForChannel(channelConfig: WebsiteWidgetConfig): boolean {
  return Boolean(
    channelConfig.ai_enabled &&
      channelConfig.ai_config &&
      channelConfig.ai_config.api_key_encrypted &&
      channelConfig.ai_config.response_mode !== 'agent_only'
  );
}
