'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Paperclip,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  X,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateSelector } from '../templates/TemplateSelector';
import { buildTemplateText } from '@/features/chat/utils/templateUtils';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onAttachFile?: (file: File) => void;
  onAttachImage?: (file: File) => void;
  onAIAssist?: () => void;
  onTemplateSelect?: (template: string) => void;
  disabled?: boolean;
  initialValue?: string;
  additionalFiles?: File[];
  onFilesCleared?: () => void;
  enableAIAssist?: boolean;
  channelId: string;
}

export function MessageInput({
  onSendMessage,
  onAttachFile,
  onAttachImage,
  onAIAssist,
  onTemplateSelect,
  disabled = false,
  initialValue = '',
  additionalFiles = [],
  onFilesCleared,
  enableAIAssist = false,
  channelId,
}: MessageInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMessage(initialValue), [initialValue]);

  useEffect(() => {
    if (additionalFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...additionalFiles]);
      onFilesCleared?.();
    }
  }, [additionalFiles, onFilesCleared]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [message]);

  const handleSendMessage = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onSendMessage(message.trim(), selectedFiles);
      setMessage('');
      setSelectedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-xl px-4 py-3">
      {/* FILE PREVIEWS */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-border/30 bg-muted/40 backdrop-blur p-3">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-md shadow-black/10">
                <span className="text-sm truncate max-w-[140px]">{file.name}</span>
                <button
                  onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div
        className={cn(
          'relative flex items-end gap-2 rounded-2xl px-3 py-2',
          'border border-border/60 bg-background/90',
          'shadow-md shadow-black/5 transition-all',
          'focus-within:border-primary/60 focus-within:shadow-primary/10',
          isDragging && 'scale-[1.02] border-primary bg-primary/5'
        )}
      >
        {/* LEFT ACTIONS */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-muted-foreground hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading || enableAIAssist}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFiles((p) => [...p, e.target.files![0]]);
                onAttachFile?.(e.target.files![0]);
              }
              e.target.value = '';
            }}
          />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-muted-foreground hover:bg-muted"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isLoading || enableAIAssist}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFiles((p) => [...p, e.target.files![0]]);
                onAttachImage?.(e.target.files![0]);
              }
              e.target.value = '';
            }}
          />

          {channelId && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:bg-muted"
              onClick={() => setShowTemplateSelector(true)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* TEXTAREA */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={enableAIAssist ? 'Modo IA activo...' : 'Escribe tu mensaje'}
          rows={1}
          disabled={disabled || isLoading || enableAIAssist}
          className="
            flex-1 resize-none bg-transparent px-2 py-1
            text-[15px] leading-relaxed
            placeholder:text-muted-foreground/50
            focus-visible:ring-0
          "
        />

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'rounded-xl',
              enableAIAssist
                ? 'bg-amber-100 text-amber-600'
                : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={onAIAssist}
          >
            <Sparkles className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={
              (!message.trim() && selectedFiles.length === 0) ||
              disabled ||
              isLoading ||
              enableAIAssist
            }
            size="icon"
            className="
              w-11 h-11 rounded-xl
              bg-primary text-primary-foreground
              shadow-lg shadow-primary/25
              transition-all
              hover:scale-110 hover:bg-primary/90
              active:scale-95
            "
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {showTemplateSelector && (
          <TemplateSelector
            open={showTemplateSelector}
            onOpenChange={setShowTemplateSelector}
            channelId={channelId}
            onSelect={(template, params) => {
              const text = buildTemplateText(template, params);
              setMessage((p) => (p ? `${p}\n${text}` : text));
              onTemplateSelect?.(text);
              setShowTemplateSelector(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
