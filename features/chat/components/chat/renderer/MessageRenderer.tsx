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
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { formatLocalTime } from '@/lib/utils/dateFormat';
import { Message, SenderType } from '@/features/chat/types';

const ReactPlayer = dynamic(
  () => import('react-player'),
  { ssr: false }
) as any;

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

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>, url: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al descargar el archivo');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'archivo';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Error al descargar:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'archivo';
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
          {message.type === 'image' && (
            <div className="p-1.5">
              {message.media_url ? (
                <>
                  <div className="relative group">
                    <img
                      src={message.media_url}
                      alt={message.media_name || 'Imagen compartida'}
                      className="rounded-xl max-h-80 w-full object-cover shadow-sm group-hover:shadow-md transition-shadow cursor-zoom-in"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback si la imagen no carga (ej: webp no soportado)
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.image-error')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'image-error rounded-xl bg-background/10 p-8 flex flex-col items-center justify-center gap-2 text-current/70';
                          errorDiv.innerHTML = `
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-xs">${message.media_name || 'Imagen no disponible'}</span>
                          `;
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                    <a
                      href={message.media_url}
                      onClick={(e) => handleDownload(e, message.media_url!, message.media_name || 'imagen')}
                      className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Descargar imagen"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                  {message.media_name && !message.body && (
                    <p className="text-xs text-muted-foreground mt-1 px-2 truncate">
                      {message.media_name}
                    </p>
                  )}
                </>
              ) : (
                <div className="rounded-xl bg-background/10 p-8 flex flex-col items-center justify-center gap-2 text-current/70">
                  <File className="w-8 h-8" />
                  <span className="text-xs">Imagen no disponible</span>
                </div>
              )}
              {message.body && (
                <p className="text-sm p-2.5 leading-relaxed">{message.body}</p>
              )}
            </div>
          )}

          {/* Audio Message */}
          {message.type === 'audio' && (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              {message.media_url ? (
                <>
                  <audio controls className="h-8 max-w-[200px]">
                    <source src={message.media_url} type={message.media_mime} />
                  </audio>
                  <a
                    href={message.media_url}
                    onClick={(e) => handleDownload(e, message.media_url!, message.media_name || 'audio')}
                    className="p-2 hover:bg-background/20 rounded-lg transition-colors"
                    title="Descargar audio"
                  >
                    <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </>
              ) : (
                <span className="text-xs opacity-70">Audio no disponible</span>
              )}
            </div>
          )}

          {/* Video Message */}
          {message.type === 'video' && message.media_url && (
            <div className="p-1.5">
              <div className="relative group">
                <div className="rounded-xl overflow-hidden shadow-sm max-h-80">
                  <ReactPlayer
                    url={message.media_url}
                    controls={true}
                    width="100%"
                    height="auto"
                    playing={false}
                    pip={true}
                    stopOnUnmount={true}
                    playsinline={true}
                  />
                </div>
                <a
                  href={message.media_url}
                  onClick={(e) => handleDownload(e, message.media_url!, message.media_name || 'video')}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Descargar video"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              {message.media_name && (
                <p className="text-xs text-muted-foreground mt-1 px-2 truncate">
                  {message.media_name}
                </p>
              )}
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
              <a
                href={message.media_url}
                onClick={(e) => handleDownload(e, message.media_url!, message.media_name || 'archivo')}
                className="p-2 hover:bg-background/20 rounded-lg transition-colors shrink-0"
                title="Descargar archivo"
              >
                <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </a>
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
            {formatLocalTime(message.created_at)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
