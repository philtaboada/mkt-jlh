'use client';

import { useState } from 'react';
import type React from 'react';

import type { Contact, Conversation } from '../../../types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactDetails } from '@/features/chat/components/ContactDetail';

interface ChatHeaderProps {
  contact: Contact;
  conversation: Conversation;
}

const channelIcons: Record<string, React.ReactNode> = {
  whatsapp: '📱',
  facebook: '👥',
  instagram: '📷',
  web: '🌐',
  website: '🌐',
};

const channelLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  web: 'Web',
  website: 'Website',
};

const channelColors: Record<string, string> = {
  whatsapp: 'bg-green-500',
  facebook: 'bg-blue-600',
  instagram: 'bg-pink-500',
  web: 'bg-purple-500',
  website: 'bg-purple-500',
};

export function ChatHeader({ contact, conversation }: ChatHeaderProps) {
  const [isContactDetailOpen, setIsContactDetailOpen] = useState(false);
  const channelIcon = channelIcons[conversation.channel] || '•';
  const channelLabel = channelLabels[conversation.channel] || conversation.channel;
  const channelColor = channelColors[conversation.channel] || 'bg-gray-500';

  const handleContactClick = () => {
    setIsContactDetailOpen(true);
  };

  const handleClosePanel = () => {
    setIsContactDetailOpen(false);
  };

  return (
    <>
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-3">
        <div className="flex items-center justify-between">
          {/* Contact Info Section - Clickable */}
          <button
            onClick={handleContactClick}
            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-muted/30 rounded-md p-1.5 -m-1.5 transition-colors cursor-pointer"
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 ring-1 ring-border/20">
                <AvatarImage
                  src={contact.avatar_url}
                  alt={contact.name || 'Contacto'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                  {contact.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              {/* Channel Badge */}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background text-white text-[10px] flex items-center justify-center font-bold shadow-sm',
                  channelColor
                )}
              >
                {channelIcon}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground truncate text-base">
                  {contact.name || 'Sin nombre'}
                </h2>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                  {channelLabel}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {contact.email && (
                  <span className="flex items-center gap-1 truncate max-w-32">
                    <span>✉️</span>
                    <span className="truncate">{contact.email}</span>
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1 truncate max-w-32">
                    <span>📞</span>
                    <span className="truncate">{contact.phone}</span>
                  </span>
                )}
                {!contact.email && !contact.phone && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Sin contacto
                  </span>
                )}
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-1.5">
                {conversation.status && (
                  <Badge
                    variant={conversation.status === 'open' ? 'default' : 'secondary'}
                    className="text-xs px-1.5 py-0 h-4"
                  >
                    {conversation.status === 'open' ? '🟢 Activo' : '⚪ Inactivo'}
                  </Badge>
                )}
                {conversation.assigned_to && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                    👤 Asignado
                  </Badge>
                )}
              </div>
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 w-8"
              title="Más opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Detail Side Panel - Custom Overlay */}
      {isContactDetailOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClosePanel}
          />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-sm bg-background border-l border-border shadow-2xl">
            <ContactDetails
              contact={contact}
              onContactUpdated={() => {
                console.log('Contact updated');
              }}
              onClose={handleClosePanel}
            />
          </div>
        </div>
      )}
    </>
  );
}
