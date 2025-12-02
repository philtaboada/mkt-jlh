// Color presets for widget customization
export const colorPresets = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Gris Oscuro', value: '#374151' },
  { name: 'Secundario', value: '#78D4E1' },
  { name: 'Primario', value: '#003E52' },
] as const;

// AI Models configuration by provider
export const aiModels = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (Recomendado)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Económico)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recomendado)' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Rápido)' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Avanzado)' },
  ],
  google: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Rápido)' },
  ],
} as const;

// Default system prompt for AI assistant
export const defaultSystemPrompt = `Eres un asistente de atención al cliente amigable y profesional. Tu objetivo es ayudar a los visitantes del sitio web respondiendo sus preguntas de manera clara y concisa.

Directrices:
- Sé amable y profesional en todo momento
- Si no conoces la respuesta, admítelo honestamente
- Si el usuario necesita ayuda especializada, ofrece transferirlo a un agente humano
- Mantén las respuestas concisas pero informativas
- Usa emojis con moderación para ser más amigable`;

// Default AI configuration
export const defaultAIConfig = {
  provider: 'openai' as const,
  model: 'gpt-4o-mini',
  system_prompt: defaultSystemPrompt,
  temperature: 0.7,
  max_tokens: 500,
  auto_reply: true,
  auto_reply_delay: 3,
  handoff_keywords: ['agente', 'humano', 'persona', 'hablar con alguien'],
  knowledge_base_enabled: false,
  knowledge_base_urls: [] as string[],
  fallback_message: 'Lo siento, no pude procesar tu mensaje. Un agente te atenderá pronto.',
};

// Type exports
export type AIProvider = keyof typeof aiModels;
export type ColorPreset = (typeof colorPresets)[number];
