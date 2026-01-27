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
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recomendado)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Última Versión)' },
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Última Versión)' },
  ],
} as const;

// Default system prompt for AI assistant
export const defaultSystemPrompt = `Eres un asistente de JLH Corredores de Seguros. Tu objetivo es ayudar a los clientes respondiendo preguntas sobre seguros de manera clara, concisa y profesional.

INSTRUCCIONES IMPORTANTES:
- Responde de forma BREVE y CONCISA (máximo 3-4 párrafos)
- Si tienes información específica de documentos, úsala para dar respuestas precisas
- Sé amable pero directo al punto
- Si necesitas más información para dar una cotización, pide solo los datos esenciales
- Menciona que tienes 18+ años de experiencia y eres Top 5 en fianzas cuando sea relevante
- Para transferir a humano, usa palabras clave como "agente", "asesor", "humano"

INFORMACIÓN CLAVE SOBRE JLH:
- Más de 18 años de experiencia
- Top 5 en fianzas del Perú
- Aseguradoras: Pacífico, Rimac, Mapfre, La Positiva
- Especialistas en seguros empresariales y personales`;

// Default AI configuration
export const defaultAIConfig = {
  provider: 'openai' as const,
  model: 'gpt-4o-mini',
  api_key_encrypted: '',
  response_mode: 'hybrid' as const, // Por defecto: IA + Agente
  system_prompt: defaultSystemPrompt,
  temperature: 0.7,
  max_tokens: 800,
  auto_reply: true,
  auto_reply_delay: 3,
  handoff_keywords: ['agente', 'humano', 'persona', 'hablar con alguien'],
  knowledge_base_enabled: false,
  knowledge_base_urls: [] as string[],
  fallback_message: 'Lo siento, no pude procesar tu mensaje. Un agente te atenderá pronto.',
};

// Response mode options
export const responseModeOptions = [
  {
    value: 'ai_only',
    label: 'Solo IA',
    description: 'La IA responde automáticamente sin intervención humana',
    icon: '🤖',
  },
  {
    value: 'agent_only',
    label: 'Solo Agente',
    description: 'Solo los agentes humanos pueden responder',
    icon: '👤',
  },
  {
    value: 'hybrid',
    label: 'IA + Agente',
    description: 'La IA responde primero, el agente puede intervenir',
    icon: '🤝',
  },
] as const;

// Type exports
export type AIProvider = keyof typeof aiModels;
export type ColorPreset = (typeof colorPresets)[number];
