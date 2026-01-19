'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  File,
  Music,
  Bot,
  User,
  Headphones,
  Check,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { Message, SenderType } from '@/features/chat/types';

interface MessageRendererProps {
  message: Message;
  senderName: string;
  senderAvatar?: string;
  isAgent: boolean;
  senderType?: SenderType;
  onFileDrop?: (files: File[]) => void;
}

export function MessageRenderer({
  message,
  senderName,
  senderAvatar,
  isAgent,
  senderType = 'user',
  onFileDrop,
}: MessageRendererProps) {
  const [isDragging, setIsDragging] = useState(false);

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
      return 'bg-violet-600 text-white rounded-2xl rounded-tr-none shadow-sm border border-violet-500/20';
    }
    if (isAgent) {
      return 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none shadow-sm border border-primary/20';
    }
    return 'bg-muted text-foreground rounded-2xl rounded-tl-none shadow-sm border border-border/50';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileDrop) {
      onFileDrop(files);
    }
  };

  const getStatusIcon = () => {
    if (!isAgent) return null;
    switch (message.status) {
      case 'sent':
        return <Check className="w-3 h-3 text-current opacity-70" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-current opacity-70" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-sky-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-1 animate-in fade-in slide-in-from-bottom-1 duration-300',
        isAgent ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isAgent && (
        <Avatar className="h-8 w-8 shrink-0 border border-border/50 shadow-sm mt-auto mb-1">
          <AvatarImage src={senderAvatar || '/placeholder.svg'} />
          <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
            {senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col gap-1 max-w-[85%] lg:max-w-[75%]">
        <div
          className={cn(
            'transition-all duration-200 overflow-hidden relative group',
            getBubbleStyle(),
            isDragging ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : ''
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Sender label for agent/bot */}
          {isAgent && (
            <div className="px-3 pt-2 pb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight opacity-70">
              {getSenderIcon()}
              <span>{senderName}</span>
            </div>
          )}

          {/* Text Message */}
          {message.type === 'text' && message.body && (
            <div className="px-4 py-2.5">
              {senderType === 'bot' ? (
                <div className="prose prose-sm max-w-none text-white prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-violet-100 prose-pre:bg-violet-700/50">
                  <ReactMarkdown>{message.body}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.body}
                </p>
              )}
            </div>
          )}

          {/* Image Message */}
          {message.type === 'image' && message.media_url && (
            <div className="p-1.5">
              <img
                src={message.media_url || '/placeholder.svg'}
                alt="Imagen compartida"
                className="rounded-xl max-h-80 w-full object-cover shadow-sm group-hover:shadow-md transition-shadow cursor-zoom-in"
              />
              {message.body && (
                <p className="text-sm p-2.5 leading-relaxed">{message.body}</p>
              )}
            </div>
          )}

          {/* Audio Message */}
          {message.type === 'audio' && message.media_url && (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <audio controls className="h-8 max-w-[200px]">
                <source src={message.media_url} type={message.media_mime} />
              </audio>
            </div>
          )}

          {/* Video Message */}
          {message.type === 'video' && message.media_url && (
            <div className="p-1.5">
              <video
                controls
                className="rounded-xl max-h-80 w-full shadow-sm"
                poster={'/video-thumbnail.png'}
              >
                <source src={message.media_url} type={message.media_mime} />
              </video>
            </div>
          )}

          {/* File Message */}
          {message.type === 'file' && message.media_url && (
            <div className="px-4 py-3 flex items-center gap-4 bg-background/5 hover:bg-background/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-background/20 flex items-center justify-center shrink-0">
                <File className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={message.media_url}
                  download={message.media_name}
                  className="text-sm font-semibold underline underline-offset-4 hover:opacity-80 truncate block"
                >
                  {message.media_name || 'Descargar archivo'}
                </a>
                {message.media_size && (
                  <p className="text-[10px] opacity-70 font-medium">
                    {(message.media_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-1',
            isAgent ? 'justify-end' : 'justify-start'
          )}
        >
          <span className="text-[10px] font-medium text-muted-foreground/70">
            {message.created_at
              ? new Date(message.created_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--'}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
