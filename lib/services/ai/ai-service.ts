/**
 * Servicio de IA para respuestas automáticas
 * Usa Vercel AI SDK v5 para soporte unificado de múltiples proveedores
 */

import { generateText, streamText, CoreMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AIConfig } from '@/features/chat/types/settings';
import { decryptApiKey } from '@/lib/utils/encryption';
import { Message } from '@/features/chat/types/message';

// Tipos para el servicio de IA
export interface AIResponse {
  content: string;
  tokensUsed?: number;
  error?: string;
}

export interface ConversationContext {
  messages: Message[];
  contactName?: string;
  channel?: string;
}

/**
 * Crea el modelo de IA según el proveedor configurado
 */
function createModel(provider: AIConfig['provider'], model: string, apiKey: string) {
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case 'google': {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Convierte mensajes del chat al formato del AI SDK
 */
function formatMessages(context?: ConversationContext): CoreMessage[] {
  if (!context?.messages || context.messages.length === 0) {
    return [];
  }

  // Tomar los últimos 10 mensajes para contexto
  const recentMessages = context.messages.slice(-10);

  return recentMessages
    .filter((msg) => msg.body) // Solo mensajes con contenido
    .map((msg): CoreMessage => ({
      role: msg.sender_type === 'user' ? 'user' : 'assistant',
      content: msg.body || '',
    }));
}

/**
 * Servicio principal de IA usando Vercel AI SDK
 */
export class AIService {
  private model: ReturnType<typeof createModel>;
  private config: AIConfig;

  private constructor(model: ReturnType<typeof createModel>, config: AIConfig) {
    this.model = model;
    this.config = config;
  }

  /**
   * Crea una instancia del servicio de IA a partir de la configuración
   */
  static async create(aiConfig: AIConfig): Promise<AIService | null> {
    if (!aiConfig.api_key_encrypted) {
      console.warn('AI Service: No API key configured');
      return null;
    }

    try {
      const apiKey = decryptApiKey(aiConfig.api_key_encrypted);

      if (!apiKey) {
        console.warn('AI Service: Failed to decrypt API key');
        return null;
      }

      const model = createModel(aiConfig.provider, aiConfig.model, apiKey);
      return new AIService(model, aiConfig);
    } catch (error) {
      console.error('AI Service creation error:', error);
      return null;
    }
  }

  /**
   * Genera una respuesta de IA (sin streaming)
   */
  async generateResponse(
    userMessage: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    try {
      const messages: CoreMessage[] = [
        ...formatMessages(context),
        { role: 'user', content: userMessage },
      ];

      const result = await generateText({
        model: this.model,
        system: this.config.system_prompt,
        messages,
        temperature: this.config.temperature,
        maxOutputTokens: this.config.max_tokens,
      });
      console.log('AI generation result:', result);
      return {
        content: result.text,
        tokensUsed: result.usage?.totalTokens,
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Genera una respuesta de IA con streaming
   * Retorna un ReadableStream para respuestas en tiempo real
   */
  async generateStreamResponse(
    userMessage: string,
    context?: ConversationContext
  ): Promise<ReadableStream<string>> {
    const messages: CoreMessage[] = [
      ...formatMessages(context),
      { role: 'user', content: userMessage },
    ];

    const result = streamText({
      model: this.model,
      system: this.config.system_prompt,
      messages,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.max_tokens,
    });

    return result.textStream;
  }

  /**
   * Verifica si el mensaje contiene palabras clave para transferir a humano
   */
  shouldHandoffToHuman(message: string): boolean {
    const keywords = this.config.handoff_keywords || [];
    const lowerMessage = message.toLowerCase();

    return keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()));
  }

  /**
   * Obtiene el mensaje de fallback configurado
   */
  getFallbackMessage(): string {
    return this.config.fallback_message || 'Lo siento, no pude procesar tu mensaje. Un agente te atenderá pronto.';
  }

  /**
   * Verifica si debe responder automáticamente
   */
  shouldAutoReply(): boolean {
    return this.config.auto_reply ?? true;
  }

  /**
   * Obtiene el delay de respuesta automática
   */
  getAutoReplyDelay(): number {
    return (this.config.auto_reply_delay || 3) * 1000; // Convertir a ms
  }

  /**
   * Obtiene el modo de respuesta
   */
  getResponseMode(): AIConfig['response_mode'] {
    return this.config.response_mode || 'hybrid';
  }

  /**
   * Obtiene el modelo actual
   */
  getModel() {
    return this.model;
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): AIConfig {
    return this.config;
  }
}
