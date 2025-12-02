'use client';

import type { Message, SenderType } from '../types/message';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { File, Music, Bot, User, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageRendererProps {
  message: Message;
  senderName: string;
  senderAvatar?: string;
  isAgent: boolean;
  senderType?: SenderType;
}

export function MessageRenderer({
  message,
  senderName,
  senderAvatar,
  isAgent,
  senderType = 'user',
}: MessageRendererProps) {
  // Icono según el tipo de sender
  const getSenderIcon = () => {
    switch (senderType) {
      case 'bot':
        return <Bot className="w-4 h-4" />;
      case 'agent':
        return <Headphones className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Color de fondo diferente para bot
  const getBubbleStyle = () => {
    if (senderType === 'bot') {
      return 'bg-violet-500 text-white rounded-br-none';
    }
    if (isAgent) {
      return 'bg-primary text-primary-foreground rounded-br-none';
    }
    return 'bg-muted text-foreground rounded-bl-none';
  };

  return (
    <div className={cn('flex gap-3', isAgent ? 'flex-row-reverse' : 'flex-row')}>
      {!isAgent && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={senderAvatar || '/placeholder.svg'} />
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-xs lg:max-w-md rounded-lg', getBubbleStyle())}>
        {/* Sender label for agent/bot */}
        {isAgent && (
          <div className="px-4 pt-2 flex items-center gap-1 text-xs opacity-80">
            {getSenderIcon()}
            <span>{senderName}</span>
          </div>
        )}

        {/* Text Message */}
        {message.type === 'text' && message.body && (
          <div className="px-4 py-2">
            <p className="text-sm">{message.body}</p>
          </div>
        )}

        {/* Image Message */}
        {message.type === 'image' && message.media_url && (
          <div className="p-1">
            <img
              src={message.media_url || '/placeholder.svg'}
              alt="Imagen compartida"
              className="rounded-md max-h-64 max-w-xs object-cover"
            />
            {message.body && <p className="text-xs p-2">{message.body}</p>}
          </div>
        )}

        {/* Audio Message */}
        {message.type === 'audio' && message.media_url && (
          <div className="px-4 py-3 flex items-center gap-2">
            <Music className="w-4 h-4" />
            <audio controls className="h-8 max-w-xs">
              <source src={message.media_url} type={message.media_mime} />
            </audio>
          </div>
        )}

        {/* Video Message */}
        {message.type === 'video' && message.media_url && (
          <div className="p-1">
            <video
              controls
              className="rounded-md max-h-64 max-w-xs"
              poster={'/video-thumbnail.png'}
            >
              <source src={message.media_url} type={message.media_mime} />
            </video>
          </div>
        )}

        {/* File Message */}
        {message.type === 'file' && message.media_url && (
          <div className="px-4 py-3 flex items-center gap-3">
            <File className="w-5 h-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <a
                href={message.media_url}
                download={message.media_name}
                className="text-sm underline hover:opacity-80 truncate block"
              >
                {message.media_name || 'Descargar archivo'}
              </a>
              {message.media_size && (
                <p className="text-xs opacity-70">
                  {(message.media_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timestamp and Status */}
        <div className="px-4 pb-1 text-xs opacity-70 flex items-center justify-end gap-1">
          <span>
            {message.created_at
              ? new Date(message.created_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--'}
          </span>
          {isAgent && (
            <span>
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && '✓✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
