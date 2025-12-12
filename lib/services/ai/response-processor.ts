/**
 * Procesador de respuestas automáticas de IA
 * Maneja la lógica de cuándo y cómo responder a los mensajes
 */

import { AIService, ConversationContext } from './ai-service';
import { AIConfig, WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { createAutoReplyMessage, getMessagesByConversation } from '@/features/chat/api/message.api';

export interface ProcessMessageParams {
  conversationId: string;
  userMessage: string;
  channelConfig: WebsiteWidgetConfig;
  contactName?: string;
  channel?: string;
  /** Si es true, guarda automáticamente la respuesta. Default: true para website */
  autoSaveReply?: boolean;
}

export interface ProcessMessageResult {
  shouldReply: boolean;
  reply?: string;
  handoffToHuman?: boolean;
  error?: string;
}

/**
 * Procesa un mensaje entrante y genera una respuesta de IA si corresponde
 */
export async function processIncomingMessage(
  params: ProcessMessageParams
): Promise<ProcessMessageResult> {
  const { 
    conversationId, 
    userMessage, 
    channelConfig, 
    contactName, 
    channel,
    autoSaveReply = channel === 'website' // Por defecto solo guarda para website
  } = params;

  // 1. Verificar si la IA está habilitada
  if (!channelConfig.ai_enabled || !channelConfig.ai_config) {
    return { shouldReply: false };
  }

  const aiConfig = channelConfig.ai_config;

  // 2. Verificar el modo de respuesta
  if (aiConfig.response_mode === 'agent_only') {
    return { shouldReply: false };
  }

  // 3. Crear instancia del servicio de IA
  const aiService = await AIService.create(aiConfig);

  if (!aiService) {
    console.warn('AI Service not available - no API key configured');
    return { shouldReply: false };
  }

  // 4. Verificar si debe transferir a humano
  if (aiService.shouldHandoffToHuman(userMessage)) {
    const handoffMessage = 'Entiendo que prefieres hablar con un agente humano. Transfiriendo tu conversación...';
    
    if (autoSaveReply) {
      await saveAndNotifyReply(conversationId, handoffMessage, aiConfig);
    }
    
    return {
      shouldReply: true,
      reply: handoffMessage,
      handoffToHuman: true,
    };
  }

  // 5. Verificar si debe responder automáticamente
  if (!aiService.shouldAutoReply()) {
    return { shouldReply: false };
  }

  // 6. Obtener contexto de la conversación
  const context = await getConversationContext(conversationId, contactName, channel);

  // 7. Generar respuesta de IA
  try {
    // Aplicar delay si está configurado
    const delay = aiService.getAutoReplyDelay();
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const response = await aiService.generateResponse(userMessage, context);

    if (response.error || !response.content) {
      // Usar mensaje de fallback
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

    // Guardar la respuesta si autoSaveReply está habilitado
    if (autoSaveReply) {
      await saveAndNotifyReply(conversationId, response.content, aiConfig);
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

/**
 * Obtiene el contexto de la conversación para la IA
 */
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

/**
 * Guarda la respuesta de la IA y notifica
 */
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

/**
 * Verifica si un canal tiene IA habilitada y configurada correctamente
 */
export function isAIEnabledForChannel(channelConfig: WebsiteWidgetConfig): boolean {
  return Boolean(
    channelConfig.ai_enabled &&
    channelConfig.ai_config &&
    channelConfig.ai_config.api_key_encrypted &&
    channelConfig.ai_config.response_mode !== 'agent_only'
  );
}
