'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle, Search, Plus, Filter, Mail, Phone, Clock, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContacts, useCreateContact } from '@/features/chat/hooks/useContacts';
import { ContactDetails } from '@/features/chat/components/ContactDetail';
import { Contact } from '@/features/chat/types/contact';
import { cn } from '@/lib/utils';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  lead: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    label: 'Lead',
  },
  open: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Abierto',
  },
  customer: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Cliente',
  },
  closed: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    label: 'Cerrado',
  },
};

const channelConfig: Record<string, { color: string; label: string }> = {
  whatsapp: { color: 'bg-emerald-500', label: 'WhatsApp' },
  facebook: { color: 'bg-blue-500', label: 'Facebook' },
  instagram: { color: 'bg-gradient-to-br from-purple-500 to-pink-500', label: 'Instagram' },
  web: { color: 'bg-muted-foreground', label: 'Web' },
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'lead' as const,
    source: 'web',
  });

  const { data: contacts = [], isLoading, refetch } = useContacts();
  const createContactMutation = useCreateContact();

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateContact = () => {
    if (!newContact.name.trim()) return;

    createContactMutation.mutate(newContact, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setNewContact({ name: '', email: '', phone: '', status: 'lead', source: 'web' });
      },
    });
  };

  return (
    <div className="flex h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Contactos</h1>
                <p className="text-sm text-muted-foreground">
                  {contacts.length} contactos en total
                </p>
              </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo contacto
                </Button>
              </DialogTrigger>
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
                        onValueChange={(value: any) =>
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
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateContact}
                    disabled={!newContact.name.trim() || createContactMutation.isPending}
                  >
                    {createContactMutation.isPending ? 'Creando...' : 'Crear contacto'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === 'all' ? 'Todos' : statusColors[statusFilter]?.label}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('lead')}>Lead</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('open')}>Abierto</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('customer')}>
                  Cliente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('closed')}>
                  Cerrado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contacts Grid */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No hay contactos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'No se encontraron contactos con esa búsqueda'
                    : 'Crea tu primer contacto para comenzar'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear contacto
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Contact Detail Panel */}
      {selectedContact && (
        <div className="w-96 border-l border-border bg-card">
          <ContactDetails
            contact={selectedContact}
            onContactUpdated={() => refetch()}
            onClose={() => setSelectedContact(null)}
          />
        </div>
      )}
    </div>
  );
}

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

function ContactCard({ contact, isSelected, onClick }: ContactCardProps) {
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
