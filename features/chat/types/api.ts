// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
}

export interface PaginationResult {
  pageIndex: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResult;
}

// ============================================================================
// Conversation API Types
// ============================================================================

export interface ConversationCounts {
  inbox: number;
  mentions: number;
  starred: number;
  snoozed: number;
  archived: number;
  unread: number;
}

// ============================================================================
// Widget API Types
// ============================================================================

export interface WidgetVisitorInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface FindWidgetConversationParams {
  channelId: string;
  visitorId: string;
}

export interface CreateWidgetConversationParams {
  channelId: string;
  visitorId: string;
  visitorInfo?: WidgetVisitorInfo;
  userAgent?: string | null;
  origin?: string | null;
  status?: 'open' | 'closed' | 'blocked' | 'bot' | 'agent';
  ia_enabled?: boolean;
}

export interface CreateWidgetMessageParams {
  conversationId: string;
  body: string;
  senderId: string;
  senderType: 'user' | 'bot' | 'agent';
  metadata?: Record<string, unknown>;
}

export interface GetMessagesAfterParams {
  conversationId: string;
  afterMessageId?: string;
}

// ============================================================================
// Contact API Types
// ============================================================================
export interface FindOrCreateContactParams {
  email: string;
  name?: string;
  phone?: string;
  source?: string;
}
