'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, Sparkles, Settings, Zap, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function ChatbotView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular respuesta del chatbot
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Gracias por tu mensaje: "${userMessage.content}". Esta es una respuesta automática del chatbot. En una implementación real, aquí se conectaría con una API de IA como OpenAI, Anthropic o un modelo local.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card">
        {/* Header */}
        <ChatbotHeader />

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
        />
      </div>

      {/* Sidebar Info */}
      <ChatbotSidebar />
    </div>
  );
}

function ChatbotHeader() {
  return (
    <div className="border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Chatbot Asistente</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm text-muted-foreground">En línea</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configurar
        </Button>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={cn('flex items-start gap-3', message.role === 'user' && 'flex-row-reverse')}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback
          className={cn(
            message.role === 'assistant'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {message.role === 'assistant' ? (
            <Bot className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'max-w-lg rounded-2xl px-4 py-3',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted text-foreground rounded-tl-sm'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-2',
            message.role === 'user' ? 'opacity-70' : 'text-muted-foreground'
          )}
        >
          {message.timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

function ChatInput({ value, onChange, onSend, onKeyPress, isLoading }: ChatInputProps) {
  return (
    <div className="border-t border-border p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 bg-muted rounded-xl p-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
          <Button
            onClick={onSend}
            disabled={!value.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatbotSidebar() {
  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-auto">
      <div className="space-y-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Estado del Bot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <Badge className="bg-emerald-500/10 text-emerald-600">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Modelo</span>
              <span className="text-sm font-medium">GPT-4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tiempo respuesta</span>
              <span className="text-sm font-medium">~1.2s</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Capacidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Respuestas inteligentes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Análisis de datos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Generación de contenido
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Asistencia técnica
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comandos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <code className="bg-muted px-2 py-0.5 rounded text-xs">/help</code>
              <span className="text-muted-foreground text-xs">Ayuda</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <code className="bg-muted px-2 py-0.5 rounded text-xs">/clear</code>
              <span className="text-muted-foreground text-xs">Limpiar</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <code className="bg-muted px-2 py-0.5 rounded text-xs">/status</code>
              <span className="text-muted-foreground text-xs">Estado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
