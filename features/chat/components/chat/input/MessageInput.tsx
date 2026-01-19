'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
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

  const handleSendMessage = async (): Promise<void> => {
    if ((!message.trim() && selectedFiles.length === 0) || disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
      setSelectedFiles([]); // Limpiar archivos después de enviar
    } catch {
      // El toast se maneja en la mutación
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
    <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/20 mb-3 max-h-32 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="relative group animate-in slide-in-from-bottom-2 duration-200"
            >
              {file.type.startsWith('image/') ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center gap-2 p-2 bg-background rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow max-w-xs">
                  <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/80 hover:scale-110 transition-all shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          'relative flex items-end gap-3 p-3 rounded-2xl border-2 transition-all duration-200 bg-background shadow-sm',
          isDragging
            ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
            : 'border-border hover:border-muted-foreground/50 hover:shadow-md'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 w-9 h-9 rounded-xl transition-all hover:scale-105"
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
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 w-9 h-9 rounded-xl transition-all hover:scale-105"
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
        </div>

        <Textarea
          ref={textareaRef}
          placeholder="Escribe tu mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="flex-1 border-0 bg-transparent p-0 px-1 resize-none min-h-8 max-h-32 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
          disabled={disabled || isLoading}
          rows={1}
        />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-amber-500 hover:bg-amber-50 w-9 h-9 rounded-xl transition-all hover:scale-105"
            onClick={onAIAssist}
            disabled={disabled || isLoading}
            title="Asistente IA"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && selectedFiles.length === 0) || disabled || isLoading}
            className="bg-primary hover:bg-primary/90 hover:scale-105 w-10 h-10 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 rounded-2xl border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">Suelta los archivos aquí</p>
          </div>
        </div>
      )}
    </div>
  );
}
