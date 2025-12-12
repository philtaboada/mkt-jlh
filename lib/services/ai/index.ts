/**
 * Servicio de IA para respuestas automáticas
 * Usa Vercel AI SDK v5 para soporte unificado de múltiples proveedores
 * 
 * Uso:
 * ```typescript
 * import { processIncomingMessage, isAIEnabledForChannel } from '@/lib/services/ai';
 * 
 * // Verificar si la IA está habilitada
 * if (isAIEnabledForChannel(channelConfig)) {
 *   const result = await processIncomingMessage({
 *     conversationId: 'xxx',
 *     userMessage: 'Hola, necesito ayuda',
 *     channelConfig,
 *   });
 * }
 * ```
 */

export { AIService } from './ai-service';
export type { AIResponse, ConversationContext } from './ai-service';

export { processIncomingMessage, isAIEnabledForChannel } from './response-processor';
export type { ProcessMessageParams, ProcessMessageResult } from './response-processor';
