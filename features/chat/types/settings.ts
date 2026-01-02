export type ChannelType = 'whatsapp' | 'website' | 'facebook' | 'instagram' | 'email';
export type ChannelStatus = 'active' | 'inactive' | 'pending';
export type AgentStatus = 'online' | 'offline' | 'busy';
export type AgentRole = 'admin' | 'agent' | 'supervisor';

// Channel (Inbox) types
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  config: ChannelConfig;
  created_at: string;
  updated_at: string;
}

export type ChannelConfig =
  | WhatsAppConfig
  | WebsiteWidgetConfig
  | FacebookConfig
  | InstagramConfig
  | EmailConfig;

export interface WhatsAppConfig {
  phone_number_id: string;
  phone_number: string;
  business_account_id: string;
  access_token?: string;
  verify_token?: string;
  webhook_verified: boolean;
}

export interface WebsiteWidgetConfig {
  widget_token: string;
  website_url: string;
  welcome_message: string;
  welcome_title: string;
  widget_color: string;
  reply_time: 'few_minutes' | 'few_hours' | 'one_day';
  pre_chat_form_enabled: boolean;
  pre_chat_fields: PreChatField[];
  online_status: 'online' | 'offline' | 'auto';
  position: 'left' | 'right';
  // AI Configuration
  ai_enabled: boolean;
  ai_config?: AIConfig;
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  api_key_encrypted?: string; // API key encriptada
  response_mode: 'ai_only' | 'agent_only' | 'hybrid'; // Modo de respuesta
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  auto_reply: boolean;
  auto_reply_delay: number; // seconds to wait before AI responds
  handoff_keywords: string[]; // keywords that trigger handoff to human
  knowledge_base_enabled: boolean;
  knowledge_base_urls: string[];
  fallback_message: string;
}

export interface PreChatField {
  name: string;
  type: 'text' | 'email' | 'phone' | 'ruc' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

export interface FacebookConfig {
  page_id: string;
  page_name: string;
  page_access_token?: string;
  verify_token?: string;
}

export interface InstagramConfig {
  account_id: string;
  username: string;
  access_token?: string;
  verify_token?: string;
}

export interface EmailConfig {
  email: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  password?: string;
}

// Agent types
export interface Agent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: AgentRole;
  status: AgentStatus;
  team_ids: string[];
  channel_ids: string[];
  auto_assign: boolean;
  max_conversations: number;
  created_at: string;
  updated_at: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  auto_assign: boolean;
  agent_ids: string[];
  channel_ids: string[];
  created_at: string;
  updated_at: string;
}

// Form types for creating/updating
export interface CreateChannelInput {
  name: string;
  type: ChannelType;
  config: Partial<ChannelConfig>;
}

export interface UpdateChannelInput {
  name?: string;
  status?: ChannelStatus;
  config?: Partial<ChannelConfig>;
}

export interface CreateAgentInput {
  user_id?: string;
  name: string;
  email: string;
  role: AgentRole;
  team_ids?: string[];
  channel_ids?: string[];
}

export interface UpdateAgentInput {
  name?: string;
  role?: AgentRole;
  status?: AgentStatus;
  team_ids?: string[];
  channel_ids?: string[];
  auto_assign?: boolean;
  max_conversations?: number;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  auto_assign?: boolean;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  auto_assign?: boolean;
  agent_ids?: string[];
  channel_ids?: string[];
}

// Widget Script Generator
export interface WidgetScriptParams {
  token: string;
  baseUrl: string;
}

/**
 * Genera el script de instalación del widget.
 * La configuración (colores, posición, mensajes) se carga automáticamente del servidor.
 * Solo necesitas pasar el token único del widget.
 */
export function generateWidgetScript(params: WidgetScriptParams): string {
  return `<script>
  (function(d,t) {
    var BASE_URL="${params.baseUrl}";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.mktChatSDK = new window.MktChatSDK("${params.token}");
      window.mktChatSDK.run();
    }
  })(document,"script");
</script>`;
}
