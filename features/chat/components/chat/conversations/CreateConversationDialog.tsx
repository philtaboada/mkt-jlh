'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, UserPlus, UserCheck, Phone, Mail, Hash } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveChannels } from '../../../hooks/useChannels';
import { useContacts } from '../../../hooks/useContacts';
import { toast } from 'sonner';
import {
  findOrCreateByEmail,
  findOrCreateByWhatsApp,
  getContactById,
} from '../../../api/contact.api';
import { findOrCreate } from '../../../api/conversation.api';
import { useRouter } from 'next/navigation';
import { SelectOptions } from '@/components/shared/select-options';

interface CreateConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (conversationId: string) => void;
}

export function CreateConversationDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateConversationDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: channels = [] } = useActiveChannels();
  const { data: contactsData } = useContacts();
  const contacts = contactsData?.pages.flatMap((page) => page.data) || [];
  const [contactMode, setContactMode] = useState<'existing' | 'new'>('existing');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedChannel = channels.find((ch: any) => ch.id === selectedChannelId);
  const isWhatsApp = selectedChannel?.type === 'whatsapp';

  const filteredContacts = useMemo(() => {
    if (!isWhatsApp) return contacts;
    return contacts.filter((c: any) => c.wa_id || c.phone);
  }, [contacts, isWhatsApp]);

  const contactOptions = useMemo(() => {
    return filteredContacts.map((contact: any) => ({
      value: contact.id,
      label: contact.name || 'Sin nombre',
      subtitle: contact.phone || contact.email || undefined,
    }));
  }, [filteredContacts]);

  const channelOptions = useMemo(() => {
    return channels.map((channel: any) => ({
      value: channel.id,
      label: channel.name,
      subtitle: channel.type ? `Canal ${channel.type}` : undefined,
    }));
  }, [channels]);

  const handleCreate = async () => {
    if (!selectedChannelId) {
      toast.error('Selecciona un canal');
      return;
    }

    if (contactMode === 'existing' && !selectedContactId) {
      toast.error('Selecciona un contacto');
      return;
    }

    if (contactMode === 'new') {
      if (isWhatsApp && !contactPhone) {
        toast.error('El número de teléfono es requerido para WhatsApp');
        return;
      }

      if (!isWhatsApp && !contactEmail) {
        toast.error('El correo electrónico es requerido');
        return;
      }
    }

    setIsLoading(true);
    try {
      let contact;

      if (contactMode === 'existing') {
        contact = await getContactById(selectedContactId);
        if (!contact) {
          toast.error('Contacto no encontrado');
          setIsLoading(false);
          return;
        }
      } else {
        if (isWhatsApp) {
          const normalizedPhone = contactPhone.replace(/[^\d]/g, '');
          contact = await findOrCreateByWhatsApp(
            normalizedPhone,
            contactName || `Contacto ${normalizedPhone}`
          );
        } else {
          contact = await findOrCreateByEmail(
            contactEmail,
            contactName || 'Nuevo Contacto',
            contactPhone,
            'manual'
          );
        }
      }

      const conversation = await findOrCreate(
        contact.id,
        selectedChannel?.type || '',
        selectedChannelId
      );
      queryClient.invalidateQueries({ queryKey: ['contacts'] });

      toast.success('Conversación creada');
      onOpenChange(false);

      // Reset form
      setContactMode('existing');
      setSelectedChannelId('');
      setSelectedContactId('');
      setContactName('');
      setContactPhone('');
      setContactEmail('');

      if (onCreated) {
        onCreated(conversation.id);
      } else {
        router.push(`/chat/inbox/${conversation.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al crear la conversación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Nueva Conversación</DialogTitle>
              <DialogDescription className="mt-1">
                Crea una nueva conversación con un contacto
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Canal Selection */}
          <div className="space-y-2.5">
            <Label htmlFor="channel" className="text-sm font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              Canal *
            </Label>
            <SelectOptions
              items={channelOptions}
              value={selectedChannelId}
              onChange={(value) => setSelectedChannelId(value as string)}
              placeholder="Selecciona un canal..."
              searchable
            />
          </div>

          {/* Contact Mode Selection */}
          {selectedChannelId && (
            <div className="space-y-2.5 pt-2 border-t">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                Tipo de Contacto
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={contactMode === 'existing' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col items-start gap-1"
                  onClick={() => setContactMode('existing')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-medium">Existente</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Seleccionar de la lista
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={contactMode === 'new' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col items-start gap-1"
                  onClick={() => setContactMode('new')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <UserPlus className="w-4 h-4" />
                    <span className="font-medium">Nuevo</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Crear nuevo contacto
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Existing Contact Selection */}
          {contactMode === 'existing' && selectedChannelId && (
            <div className="space-y-2.5 pt-2 border-t">
              <Label htmlFor="contact" className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                Seleccionar Contacto *
              </Label>
              <SelectOptions
                items={contactOptions}
                value={selectedContactId}
                onChange={(value) => setSelectedContactId(value as string)}
                placeholder="Buscar y seleccionar contacto..."
                searchable
              />
            </div>
          )}

          {/* New Contact Form */}
          {contactMode === 'new' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  Nombre del Contacto
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Juan Pérez"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-10"
                />
              </div>

              {isWhatsApp ? (
                <div className="space-y-2.5">
                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Número de Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="51987654321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el número sin espacios ni caracteres especiales
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@ejemplo.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="phone-optional"
                      className="text-sm font-semibold flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Teléfono (opcional)
                    </Label>
                    <Input
                      id="phone-optional"
                      type="tel"
                      placeholder="51987654321"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isLoading} className="min-w-[140px]">
            {isLoading ? (
              <>
                <span className="animate-pulse">Creando...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Crear Conversación
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
