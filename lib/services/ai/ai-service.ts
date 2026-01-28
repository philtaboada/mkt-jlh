import { generateText, streamText, type ModelMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { searchRelevantChunks } from '@/features/chat/api/embbeding';
import { AIConfig } from '@/features/chat/types/settings';
import { decryptApiKey } from '@/lib/utils/encryption';
import { Message } from '@/features/chat/types/message';

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  error?: string;
  handoffToHuman?: boolean;
}

export interface ConversationContext {
  messages: Message[];
  contactName?: string;
  channel?: string;
}

function createModel(provider: AIConfig['provider'], model: string, apiKey: string) {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })(model);
    case 'anthropic':
      return createAnthropic({ apiKey })(model);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

function formatMessages(context?: ConversationContext): ModelMessage[] {
  if (!context?.messages?.length) return [];

  return context.messages
    .slice(-10)
    .filter((m) => m.body)
    .map((m) => ({
      role: m.sender_type === 'user' ? 'user' : 'assistant',
      content: m.body!,
    }));
}

export class AIService {
  private model: ReturnType<typeof createModel>;
  private config: AIConfig;

  private constructor(model: ReturnType<typeof createModel>, config: AIConfig) {
    this.model = model;
    this.config = config;
  }

  static async create(config: AIConfig): Promise<AIService | null> {
    if (!config.api_key_encrypted) return null;

    try {
      const apiKey = decryptApiKey(config.api_key_encrypted);
      if (!apiKey) return null;

      const model = createModel(config.provider, config.model, apiKey);
      return new AIService(model, config);
    } catch (err) {
      console.error('AIService create error:', err);
      return null;
    }
  }

  async generateResponse(userMessage: string, context?: ConversationContext): Promise<AIResponse> {
    try {
      const chunks = await searchRelevantChunks(userMessage);
      const ragContext = chunks.length
        ? `\n\nInformación relevante:\n${chunks.map((c) => c.content).join('\n\n')}`
        : '';

      const messages: ModelMessage[] = [
        ...formatMessages(context),
        { role: 'user', content: `${userMessage}${ragContext}` },
      ];

      const result = await generateText({
        model: this.model,
        system: this.config.system_prompt,
        messages,
        temperature: this.config.temperature,
        maxOutputTokens: this.config.max_tokens || 800,
      });

      const rawText = result.text;
      const handoffToHuman = rawText.includes('<<HANDOFF_TO_HUMAN>>');

      return {
        content: rawText.replace('<<HANDOFF_TO_HUMAN>>', '').trim(),
        tokensUsed: result.usage?.totalTokens,
        handoffToHuman,
      };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateStreamResponse(
    userMessage: string,
    context?: ConversationContext
  ): Promise<ReadableStream<string>> {
    const chunks = await searchRelevantChunks(userMessage);
    const ragContext = chunks.length
      ? `\n\nInformación relevante:\n${chunks.map((c) => c.content).join('\n\n')}`
      : '';

    const messages: ModelMessage[] = [
      ...formatMessages(context),
      { role: 'user', content: `${userMessage}${ragContext}` },
    ];

    const result = streamText({
      model: this.model,
      system: this.config.system_prompt,
      messages,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.max_tokens || 800,
    });

    return result.textStream;
  }

  getFallbackMessage(): string {
    return (
      this.config.fallback_message ||
      'Lo siento, no pude procesar tu mensaje. Un agente te atenderá.'
    );
  }
}
