'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  Clock,
  UserCircle,
  MessageCircle,
  Copy,
  Trash2,
  Edit,
  Star,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { Contact } from '@/features/chat/types/contact';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string; icon: React.ReactNode }
> = {
  lead: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Lead',
    icon: <Zap className="w-3 h-3" />,
  },
  open: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Abierto',
    icon: <MessageSquare className="w-3 h-3" />,
  },
  customer: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Cliente',
    icon: <Star className="w-3 h-3" />,
  },
  closed: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    label: 'Cerrado',
    icon: <UserCircle className="w-3 h-3" />,
  },
};

const channelConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  whatsapp: {
    color: 'bg-emerald-500',
    label: 'WhatsApp',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
  },
  facebook: {
    color: 'bg-blue-600',
    label: 'Facebook',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
  },
  instagram: {
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    label: 'Instagram',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
  },
  web: {
    color: 'bg-slate-500',
    label: 'Web',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
  },
};

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onFavorite?: (contactId: string) => void;
  onMessage?: (contact: Contact) => void;
  isFavorite?: boolean;
}

export function ContactCard({
  contact,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onFavorite,
  onMessage,
  isFavorite = false,
}: ContactCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const status = statusConfig[contact.status || 'lead'];
  const channel = channelConfig[contact.source || 'web'];

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
    }
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact.phone) {
      navigator.clipboard.writeText(contact.phone);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(contact);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(contact.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(contact.id);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.(contact);
  };

  return (
    <Card
      className={cn(
        'border-border cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary border-primary shadow-md',
        !isSelected && 'hover:border-primary/50'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left: Avatar y Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src={contact.avatar_url || undefined} />
                <AvatarFallback className="bg-linear-to-br from-primary/80 to-primary/60 text-primary-foreground text-xs font-semibold">
                  {contact.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              {contact.source && (
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center text-xs',
                    channel?.color
                  )}
                  title={channel?.label}
                >
                  {channel?.icon}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-foreground truncate text-sm">
                  {contact.name || 'Sin nombre'}
                </h3>
                <Badge
                  className={cn(status.bg, status.text, 'text-xs gap-0.5 shrink-0 px-1.5 py-0')}
                  variant="secondary"
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {contact.email && (
                  <div className="flex items-center gap-0.5 hover:text-foreground transition-colors group/email">
                    <Mail className="w-2.5 h-2.5" />
                    <span className="truncate">{contact.email}</span>
                    {isHovering && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 opacity-0 group-hover/email:opacity-100 transition-opacity"
                        onClick={handleCopyEmail}
                      >
                        <Copy className="w-2 h-2" />
                      </Button>
                    )}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-0.5 hover:text-foreground transition-colors group/phone">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{contact.phone}</span>
                    {isHovering && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 opacity-0 group-hover/phone:opacity-100 transition-opacity"
                        onClick={handleCopyPhone}
                      >
                        <Copy className="w-2 h-2" />
                      </Button>
                    )}
                  </div>
                )}
                {!contact.email && !contact.phone && (
                  <div className="flex items-center gap-0.5">
                    <UserCircle className="w-2.5 h-2.5" />
                    <span>Sin contacto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Last interaction */}
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0 whitespace-nowrap">
            <Clock className="w-2.5 h-2.5" />
            {contact.last_interaction ? formatTime(new Date(contact.last_interaction)) : 'Sin int.'}
          </div>

          {/* Right: Actions */}
          <div
            className={cn(
              'flex gap-0.5 transition-all duration-200 shrink-0',
              isHovering ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Enviar mensaje"
              onClick={handleMessage}
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              onClick={handleFavorite}
            >
              <Star
                className={cn('w-3 h-3', isFavorite ? 'fill-yellow-400 text-yellow-400' : '')}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Editar"
              onClick={handleEdit}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Eliminar"
              onClick={handleDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
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
