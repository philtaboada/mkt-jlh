import { generateText, streamText, type ModelMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateEmbedding, searchRelevantChunks } from '@/features/chat/api/embbeding';
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
function formatMessages(context?: ConversationContext): ModelMessage[] {
  if (!context?.messages || context.messages.length === 0) {
    return [];
  }

  // Tomar los últimos 10 mensajes para mejor contexto/memoria
  const recentMessages = context.messages.slice(-10);

  return recentMessages
    .filter((msg) => msg.body) // Solo mensajes con contenido
    .map(
      (msg): ModelMessage => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.body || '',
      })
    );
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
   * Obtiene contenido de URLs de la base de conocimientos
   */
  private async fetchKnowledgeBaseContent(): Promise<string> {
    if (!this.config.knowledge_base_enabled || !this.config.knowledge_base_urls?.length) {
      return '';
    }

    try {
      // Limitar a las primeras 3 URLs para velocidad
      const urlsToFetch = this.config.knowledge_base_urls.slice(0, 3);

      const fetchPromises = urlsToFetch.map(async (url) => {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; JLH-ChatBot/1.0)',
            },
            signal: AbortSignal.timeout(3000), // Reducido a 3s
          });

          if (response.ok) {
            const text = await response.text();
            const textContent = text
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 2000); // Reducido a 2000 chars

            return textContent ? `Contenido de ${url}:\n${textContent}` : '';
          }
        } catch (error) {
          console.warn(`Error fetching knowledge base URL ${url}:`, error);
        }
        return '';
      });

      const contents = await Promise.all(fetchPromises);
      const validContents = contents.filter((content) => content.length > 0);

      return validContents.length > 0
        ? `\n\nInformación adicional de la base de conocimientos:\n${validContents.join('\n\n')}`
        : '';
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      return '';
    }
  }

  /**
   * Busca chunks relevantes usando embeddings y RAG
   */
  private async searchRelevantChunks(query: string, topK: number = 3): Promise<string[]> {
    console.log('🔍 RAG: Buscando chunks relevantes para query:', query.substring(0, 100) + '...');
    const results = await searchRelevantChunks(query, topK);
    console.log(`📊 RAG: Encontrados ${results.length} chunks relevantes de ${topK} solicitados`);
    if (results.length > 0) {
      console.log('📄 RAG: Primer chunk encontrado:', results[0].content.substring(0, 200) + '...');
    }
    return results.map((r) => r.content);
  }

  /**
   * Genera una respuesta de IA (sin streaming)
   */
  async generateResponse(userMessage: string, context?: ConversationContext): Promise<AIResponse> {
    try {
      console.log(
        '🤖 AI: Generando respuesta para mensaje:',
        userMessage.substring(0, 100) + '...'
      );

      // Buscar chunks relevantes en lugar de fetch URLs
      const relevantChunks = await this.searchRelevantChunks(userMessage);
      const knowledgeBaseContent =
        relevantChunks.length > 0
          ? `\n\nInformación relevante de documentos:\n${relevantChunks.join('\n\n')}`
          : '';

      if (knowledgeBaseContent) {
        console.log('📚 AI: Usando RAG - agregando contexto de base de conocimientos');
      } else {
        console.log('📚 AI: No se encontró información relevante en la base de conocimientos');
      }

      const userMessageWithContext = knowledgeBaseContent
        ? `${userMessage}${knowledgeBaseContent}`
        : userMessage;

      const messages: ModelMessage[] = [
        ...formatMessages(context),
        { role: 'user', content: userMessageWithContext },
      ];

      const result = await generateText({
        model: this.model,
        system: this.config.system_prompt,
        messages,
        temperature: this.config.temperature,
        maxOutputTokens: this.config.max_tokens || 800,
      });
      console.log(
        '✅ AI: Respuesta generada exitosamente, tokens usados:',
        result.usage?.totalTokens
      );
      return {
        content: result.text,
        tokensUsed: result.usage?.totalTokens,
      };
    } catch (error) {
      console.error('❌ AI: Error generando respuesta:', error);
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
    console.log(
      '🎯 AI Stream: Iniciando generación de respuesta streaming para:',
      userMessage.substring(0, 100) + '...'
    );

    // Buscar chunks relevantes
    const relevantChunks = await this.searchRelevantChunks(userMessage);
    const knowledgeBaseContent =
      relevantChunks.length > 0
        ? `\n\nInformación relevante de documentos:\n${relevantChunks.join('\n\n')}`
        : '';

    if (knowledgeBaseContent) {
      console.log('📚 AI Stream: Usando RAG - contexto agregado para respuesta streaming');
    } else {
      console.log('📚 AI Stream: Sin información relevante de base de conocimientos');
    }

    const userMessageWithContext = knowledgeBaseContent
      ? `${userMessage}${knowledgeBaseContent}`
      : userMessage;

    const messages: ModelMessage[] = [
      ...formatMessages(context),
      { role: 'user', content: userMessageWithContext },
    ];

    console.log('🚀 AI Stream: Iniciando streaming de respuesta...');
    const result = streamText({
      model: this.model,
      system: this.config.system_prompt,
      messages,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.max_tokens || 800,
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
    return (
      this.config.fallback_message ||
      'Lo siento, no pude procesar tu mensaje. Un agente te atenderá pronto.'
    );
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
