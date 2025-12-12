'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ContactStatus = 'lead' | 'open' | 'customer' | 'closed';

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contact: {
    name: string;
    email: string;
    phone: string;
    status: ContactStatus;
    source: string;
  }) => void;
  isLoading: boolean;
}

export function CreateContactDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateContactDialogProps) {
  const [newContact, setNewContact] = useState<{
    name: string;
    email: string;
    phone: string;
    status: ContactStatus;
    source: string;
  }>({
    name: '',
    email: '',
    phone: '',
    status: 'lead',
    source: 'web',
  });

  const handleSubmit = () => {
    onSubmit(newContact);
    setNewContact({ name: '', email: '', phone: '', status: 'lead', source: 'web' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo contacto</DialogTitle>
          <DialogDescription>Agrega un nuevo contacto a tu lista.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Nombre del contacto"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@ejemplo.com"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="+51 999 888 777"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={newContact.status}
                onValueChange={(value: ContactStatus) =>
                  setNewContact({ ...newContact, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select
                value={newContact.source}
                onValueChange={(value) => setNewContact({ ...newContact, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!newContact.name.trim() || isLoading}>
            {isLoading ? 'Creando...' : 'Crear contacto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
