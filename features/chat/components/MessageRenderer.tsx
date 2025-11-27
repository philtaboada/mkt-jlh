'use client';

import type { Message } from '../types/message';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { File, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageRendererProps {
  message: Message;
  senderName: string;
  senderAvatar?: string;
  isAgent: boolean;
}

export function MessageRenderer({
  message,
  senderName,
  senderAvatar,
  isAgent,
}: MessageRendererProps) {
  return (
    <div className={cn('flex gap-3', isAgent ? 'flex-row-reverse' : 'flex-row')}>
      {!isAgent && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar || '/placeholder.svg'} />
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-xs lg:max-w-md rounded-lg',
          isAgent
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
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
            <File className="w-5 h-5 flex-shrink-0" />
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
