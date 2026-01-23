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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveChannels } from '../../../hooks/useChannels';
import { useContacts } from '../../../hooks/useContacts';
import { toast } from 'sonner';
import { findOrCreateByEmail, findOrCreateByWhatsApp, getContactById } from '../../../api/contact.api';
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
  const { data: channels = [] } = useActiveChannels();
  const { data: contacts = [] } = useContacts();
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
      label: `${contact.name || 'Sin nombre'}${contact.phone ? ` - ${contact.phone}` : ''}${contact.email ? ` (${contact.email})` : ''}`,
    }));
  }, [filteredContacts]);

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
        console.log('✅ Usando contacto existente:', contact.id, contact.name);
      } else {
        console.log('📝 Creando nuevo contacto...');
        if (isWhatsApp) {
          const normalizedPhone = contactPhone.replace(/[^\d]/g, '');
          contact = await findOrCreateByWhatsApp(normalizedPhone, contactName || `Contacto ${normalizedPhone}`);
          console.log('✅ Contacto creado/obtenido (WhatsApp):', contact.id, contact.name);
        } else {
          contact = await findOrCreateByEmail(
            contactEmail,
            contactName || 'Nuevo Contacto',
            contactPhone,
            'manual'
          );
          console.log('✅ Contacto creado/obtenido (Email):', contact.id, contact.name);
        }
      }

      // Crear conversación relacionando el contacto con el canal
      console.log('💬 Creando conversación para contacto:', contact.id, 'canal:', selectedChannel?.type, 'channel_id:', selectedChannelId);
      const conversation = await findOrCreate(
        contact.id,
        selectedChannel?.type || '',
        selectedChannelId
      );
      console.log('✅ Conversación creada/obtenida:', conversation.id);

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Conversación</DialogTitle>
          <DialogDescription>
            Crea una nueva conversación con un contacto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channel">Canal *</Label>
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger id="channel">
                <SelectValue placeholder="Selecciona un canal" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel: any) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name} ({channel.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChannelId && (
            <div className="space-y-2">
              <Label>Contacto</Label>
              <Select value={contactMode} onValueChange={(value) => setContactMode(value as 'existing' | 'new')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Seleccionar contacto existente</SelectItem>
                  <SelectItem value="new">Crear nuevo contacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {contactMode === 'existing' && selectedChannelId && (
            <div className="space-y-2">
              <Label htmlFor="contact">Seleccionar Contacto *</Label>
              <SelectOptions
                items={contactOptions}
                value={selectedContactId}
                onChange={(value) => setSelectedContactId(value as string)}
                placeholder="Buscar y seleccionar contacto..."
                searchable
              />
            </div>
          )}

          {contactMode === 'new' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del contacto"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              {isWhatsApp ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    placeholder="51987654321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@ejemplo.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-optional">Teléfono (opcional)</Label>
                    <Input
                      id="phone-optional"
                      placeholder="51987654321"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear Conversación'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
