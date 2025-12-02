'use client';

import { AtSign, MessageCircle, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data for mentions
const mentions = [
  {
    id: '1',
    mentionedBy: 'Carlos García',
    avatar: null,
    message: '@usuario mira esta conversación, necesito tu opinión sobre el tema.',
    conversationId: 'conv-1',
    contactName: 'María López',
    channel: 'whatsapp',
    time: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    isRead: false,
  },
  {
    id: '2',
    mentionedBy: 'Ana Rodríguez',
    avatar: null,
    message: '@usuario podrías revisar este caso? El cliente necesita ayuda urgente.',
    conversationId: 'conv-2',
    contactName: 'Pedro Sánchez',
    channel: 'facebook',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
  },
];

export default function MentionsPage() {
  return (
    <div className="flex h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AtSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Menciones</h1>
              <p className="text-sm text-muted-foreground">
                Conversaciones donde te han mencionado
              </p>
            </div>
          </div>
        </div>

        {/* Mentions List */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {mentions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AtSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Sin menciones</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Cuando alguien te mencione en una conversación, aparecerá aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              mentions.map((mention) => (
                <Card
                  key={mention.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !mention.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mention.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {mention.mentionedBy.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{mention.mentionedBy}</span>
                          <span className="text-muted-foreground">te mencionó</span>
                          {!mention.isRead && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">
                              Nuevo
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{mention.message}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{mention.contactName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span className="capitalize">{mention.channel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(mention.time)}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        Ver conversación
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
