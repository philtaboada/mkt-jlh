'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onAttachFile?: (file: File) => void;
  onAttachImage?: (file: File) => void;
  onAIAssist?: () => void;
  onTemplateSelect?: (template: string) => void;
  disabled?: boolean;
  initialValue?: string;
  additionalFiles?: File[];
  onFilesCleared?: () => void;
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
}: MessageInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (additionalFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...additionalFiles]);
      onFilesCleared?.();
    }
  }, [additionalFiles, onFilesCleared]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || disabled || isLoading) return;

    setIsLoading(true);
    try {
      onSendMessage(message.trim());
      setMessage('');
      setSelectedFiles([]); // Limpiar archivos después de enviar
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Si es una imagen
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setSelectedFiles((prev) => [...prev, file]);
          onAttachImage?.(file);
        }
      }
      // Si es texto, dejar que se pegue normalmente
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSendMessage();
      }
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFiles((prev) => [...prev, file]);
      onAttachFile?.(file);
    }
    e.target.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFiles((prev) => [...prev, file]);
      onAttachImage?.(file);
    }
    e.target.value = '';
  };

  const handleTemplateInsert = (templateText: string) => {
    setMessage((prev) => (prev ? `${prev}\n${templateText}` : templateText));
    onTemplateSelect?.(templateText);
  };

  return (
    <div className="border-t border-border p-4">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg border mb-3">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center gap-2 p-2 bg-background rounded-lg border max-w-xs">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/80"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          'relative flex items-center gap-2 p-3 rounded-lg  transition-colors bg-transparent',
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary w-8 h-8 shrink-0"
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

        <Textarea
          ref={textareaRef}
          placeholder="Escribe tu mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="flex-1 border-0 bg-transparent p-0 px-3 resize-none min-h-8 max-h-32 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          disabled={disabled || isLoading}
          rows={1}
        />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary w-8 h-8"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isLoading}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={disabled || isLoading}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary w-8 h-8"
            onClick={() => handleTemplateInsert('Hello!')}
            disabled={disabled || isLoading}
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-amber-500 hover:bg-amber-50 w-8 h-8"
            onClick={onAIAssist}
            disabled={disabled || isLoading}
            title="Asistente IA"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && selectedFiles.length === 0) || disabled || isLoading}
            className="bg-primary hover:bg-primary/90 w-8 h-8 rounded-full"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
