'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onAttachFile?: (file: File) => void;
  onAIAssist?: () => void;
  onTemplateSelect?: (template: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export function MessageInput({
  onSendMessage,
  onAttachFile,
  onAIAssist,
  onTemplateSelect,
  disabled = false,
  initialValue = '',
}: MessageInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  const handleSendMessage = async () => {
    if (!message.trim() || disabled || isLoading) return;

    setIsLoading(true);
    try {
      onSendMessage(message.trim());
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    const files = e.dataTransfer.files;
    if (files.length > 0 && onAttachFile) {
      onAttachFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAttachFile) {
      onAttachFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleTemplateInsert = (templateText: string) => {
    setMessage((prev) => (prev ? `${prev}\n${templateText}` : templateText));
    onTemplateSelect?.(templateText);
  };

  return (
    <div className="border-t border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isLoading}
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
          onClick={() => handleTemplateInsert('Hello!')}
          disabled={disabled || isLoading}
        >
          <Smile className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-amber-500 hover:bg-amber-50"
          onClick={onAIAssist}
          disabled={disabled || isLoading}
          title="Asistente IA"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      <div
        className={cn(
          'flex items-center gap-2 p-3 rounded-lg border-2 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-transparent bg-transparent'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          placeholder="Escribe tu mensaje... (Shift+Enter para nueva línea)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-0 bg-transparent p-0"
          disabled={disabled || isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled || isLoading}
          className="bg-primary hover:bg-primary/90"
          size="icon"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
