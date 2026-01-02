'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { channelTypeIcons, statusConfig } from './constants';
import { formatTime } from './utils';

interface ConversationItemProps {
  conversation: any;
  channelsMap: Record<string, { id: string; name: string; type: string }>;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  channelsMap,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const status = statusConfig[conversation.status] || statusConfig.open;

  // Obtener info del canal - primero del join, luego del mapa, luego fallback
  const channelFromJoin = conversation.mkt_channels;
  const channelFromMap = channelsMap[conversation.channel_id];
  const channelInfo = channelFromJoin || channelFromMap;
  const channelType = channelInfo?.type || conversation.channel || 'web';
  const typeConfig = channelTypeIcons[channelType] || { icon: '🔗', bgColor: 'bg-gray-500' };

  const hasUnread = (conversation.unread_count || 0) > 0;

  // Obtener nombre del contacto o del visitante web
  const contactName =
    conversation.mkt_contacts?.name ||
    (conversation.metadata as { visitor_info?: { name?: string } })?.visitor_info?.name ||
    (conversation.channel === 'website' || channelType === 'website'
      ? 'Visitante Web'
      : 'Sin nombre');

  const avatarUrl = conversation.mkt_contacts?.avatar_url;
  const avatarInitial = contactName?.charAt(0)?.toUpperCase() || '?';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 text-left transition-all duration-200 hover:bg-muted/60 group',
        isSelected && 'bg-primary/8 border-l-3 border-l-primary shadow-sm',
        hasUnread && !isSelected && 'bg-primary/3'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with channel indicator */}
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 ring-1 ring-border/20">
            <AvatarImage src={avatarUrl} alt={contactName} className="object-cover" />
            <AvatarFallback
              className={cn(
                'text-xs font-semibold',
                hasUnread ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-medium shadow-sm',
              typeConfig.bgColor
            )}
            title={channelInfo?.name || channelType}
          >
            <span>{typeConfig.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Header: Name and timestamp */}
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                'text-sm font-medium line-clamp-1 max-w-[65%]',
                hasUnread ? 'text-foreground font-semibold' : 'text-foreground'
              )}
            >
              {contactName}
            </h3>
            <time
              className={cn(
                'text-xs shrink-0',
                hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {conversation.last_message_at && formatTime(new Date(conversation.last_message_at))}
            </time>
          </div>

          {/* Last message preview */}
          <p
            className={cn(
              'text-xs leading-snug line-clamp-1',
              hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {conversation.last_message_body || 'Sin mensajes'}
          </p>

          {/* Footer: Status, channel and unread badge */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.color)} />
                <span className="text-xs text-muted-foreground font-medium">{status.label}</span>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  'h-4 px-1.5 text-[10px] font-medium border-0',
                  typeConfig.bgColor,
                  'text-white hover:opacity-90'
                )}
              >
                {channelInfo?.name || channelType}
              </Badge>
            </div>

            {hasUnread && (
              <Badge
                variant="default"
                className="h-4 min-w-4 px-1 text-xs bg-primary hover:bg-primary font-bold rounded-full"
              >
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
