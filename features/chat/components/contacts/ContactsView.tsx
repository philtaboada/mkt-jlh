'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, Search, Plus, Filter, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useContacts, useCreateContact } from '@/features/chat/hooks/useContacts';
import { ContactDetails } from '@/features/chat/components/ContactDetail';
import { ContactCard } from './ContactCard';
import { Contact } from '@/features/chat/types/contact';
import { ContactFormDialog } from '@/features/chat/components/dialogs/ContactFormDialog';

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

export function ContactsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const handleCreateContact = (newContact: {
    name: string;
    email: string;
    phone: string;
    status: 'lead' | 'open' | 'customer' | 'closed';
    source: string;
  }) => {
    if (!newContact.name.trim()) return;

    createContactMutation.mutate(newContact, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  return (
    <div className="flex h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ContactsHeader
          contactsCount={contacts.length}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />

        {/* Search and Filters */}
        <div className="bg-card border-b border-border px-6 pb-4">
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
              <ContactsGridSkeleton />
            ) : filteredContacts.length === 0 ? (
              <ContactsEmptyState
                searchQuery={searchQuery}
                onCreateClick={() => setIsCreateDialogOpen(true)}
              />
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

      {/* Create Contact Dialog */}
      <ContactFormDialog
        mode="edit"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateContact}
        isLoading={createContactMutation.isPending}
      />
    </div>
  );
}

function ContactsHeader({
  contactsCount,
  onCreateClick,
}: {
  contactsCount: number;
  onCreateClick: () => void;
}) {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Contactos</h1>
            <p className="text-sm text-muted-foreground">{contactsCount} contactos en total</p>
          </div>
        </div>
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo contacto
        </Button>
      </div>
    </div>
  );
}

function ContactsGridSkeleton() {
  return (
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
  );
}

function ContactsEmptyState({
  searchQuery,
  onCreateClick,
}: {
  searchQuery: string;
  onCreateClick: () => void;
}) {
  return (
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
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Crear contacto
        </Button>
      )}
    </div>
  );
}
