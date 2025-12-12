'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Clock, UserCircle } from 'lucide-react';
import { Contact } from '@/features/chat/types/contact';
import { cn } from '@/lib/utils';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  lead: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Lead' },
  open: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Abierto' },
  customer: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Cliente',
  },
  closed: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Cerrado' },
};

const channelConfig: Record<string, { color: string; label: string }> = {
  whatsapp: { color: 'bg-emerald-500', label: 'WhatsApp' },
  facebook: { color: 'bg-blue-500', label: 'Facebook' },
  instagram: { color: 'bg-gradient-to-br from-purple-500 to-pink-500', label: 'Instagram' },
  web: { color: 'bg-muted-foreground', label: 'Web' },
};

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

export function ContactCard({ contact, isSelected, onClick }: ContactCardProps) {
  const status = statusColors[contact.status || 'lead'];
  const channel = channelConfig[contact.source || 'web'];

  return (
    <Card
      className={cn(
        'border-border cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {contact.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              {contact.source && (
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background',
                    channel?.color
                  )}
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {contact.name || 'Sin nombre'}
              </h3>
              <Badge className={cn(status.bg, status.text, 'text-xs mt-1')} variant="secondary">
                {status.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {contact.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{contact.phone}</span>
            </div>
          )}
          {!contact.email && !contact.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Sin información de contacto</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {contact.last_interaction
              ? formatTime(new Date(contact.last_interaction))
              : 'Sin interacción'}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
