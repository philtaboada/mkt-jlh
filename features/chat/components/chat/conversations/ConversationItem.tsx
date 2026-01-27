'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { channelTypeIcons, statusConfig } from './constants';
import { formatTime } from './utils';
import {
  MessageSquare,
  MoreVertical,
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  Bot,
  User,
} from 'lucide-react';
import { updateConversationStatus, deleteConversation } from '../../../api/conversation.api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ConversationItemProps {
  conversation: any;
  channelsMap: Record<string, { id: string; name: string; type: string }>;
  isSelected: boolean;
  onClick: () => void;
  onDeleted?: () => void;
}

export function ConversationItem({
  conversation,
  channelsMap,
  isSelected,
  onClick,
  onDeleted,
}: ConversationItemProps) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const status = statusConfig[conversation.status] || statusConfig.open;

  const handleStatusChange = async (
    newStatus: 'open' | 'closed' | 'pending' | 'snoozed' | 'bot' | 'agent'
  ) => {
    try {
      await updateConversationStatus(conversation.id, newStatus);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversación eliminada');
      setShowDeleteDialog(false);
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error al eliminar la conversación');
    } finally {
      setIsDeleting(false);
    }
  };

  // Obtener info del canal - primero del join, luego del mapa, luego fallback
  const channelFromJoin = conversation.mkt_channels;
  const channelFromMap = channelsMap[conversation.channel_id];
  const channelInfo = channelFromJoin || channelFromMap;
  const channelType = channelInfo?.type || conversation.channel || 'web';
  const typeConfig = channelTypeIcons[channelType] || {
    icon: MessageSquare,
    bgColor: 'bg-muted-foreground',
  };
  const IconComponent = typeConfig.icon;

  const hasUnread = (conversation.unread_count || 0) > 0;

  // Obtener nombre del contacto o del visitante web
  const contactName =
    conversation.mkt_contacts?.name ||
    (conversation.metadata as { visitor_info?: { name?: string } })?.visitor_info?.name ||
    (conversation.channel === 'website' || channelType === 'website'
      ? 'Visitante Web'
      : 'Sin nombre');

  const avatarUrl = conversation.mkt_contacts?.avatar_url;
  const avatarInitial = contactName?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <div
        className={cn(
          'w-full p-4 transition-all duration-200 border-l-2 border-transparent hover:bg-muted/50 group relative flex items-start gap-3',
          isSelected && 'bg-primary/5 border-l-primary shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)]',
          hasUnread && !isSelected && 'bg-primary/2'
        )}
      >
        <button onClick={onClick} className="flex-1 flex items-start gap-3 text-left">
          {/* Avatar with channel indicator */}
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 border border-border/50 shadow-sm group-hover:shadow transition-shadow">
              <AvatarImage src={avatarUrl} alt={contactName} className="object-cover" />
              <AvatarFallback
                className={cn(
                  'text-sm font-semibold',
                  hasUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center shadow-sm text-white',
                typeConfig.bgColor
              )}
              title={channelInfo?.name || channelType}
            >
              <IconComponent className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Header: Name and timestamp */}
            <div className="flex items-center justify-between gap-2">
              <h3
                className={cn(
                  'text-sm font-semibold truncate',
                  hasUnread ? 'text-foreground' : 'text-foreground/90 font-medium'
                )}
              >
                {contactName}
              </h3>
              <time
                className={cn(
                  'text-[11px] shrink-0 font-medium',
                  hasUnread ? 'text-primary' : 'text-muted-foreground/70'
                )}
              >
                {conversation.last_message_at && formatTime(new Date(conversation.last_message_at))}
              </time>
            </div>

            {/* Last message preview */}
            <p
              className={cn(
                'text-xs leading-normal line-clamp-1',
                hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground/80'
              )}
            >
              {conversation.last_message_body || 'Sin mensajes'}
            </p>

            {/* Footer: Status, channel and unread badge */}
            <div className="flex items-center justify-between mt-1">
              {hasUnread && (
                <Badge
                  variant="default"
                  className="h-5 min-w-5 px-1 text-[10px] bg-primary hover:bg-primary font-black rounded-full shadow-sm flex items-center justify-center animate-in zoom-in duration-300"
                >
                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                </Badge>
              )}
            </div>
          </div>
        </button>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('open');
              }}
              className="cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Abrir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('pending');
              }}
              className="cursor-pointer"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pendiente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('closed');
              }}
              className="cursor-pointer"
            >
              <Archive className="w-4 h-4 mr-2" />
              Cerrar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('bot');
              }}
              className="cursor-pointer"
            >
              <Bot className="w-4 h-4 mr-2" />
              Asignar a Bot
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('agent');
              }}
              className="cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Asignar a Agente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta conversación y
              todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
