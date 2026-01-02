'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Smartphone, Calendar, Link2, X, UserPlus, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { EditContactDialog } from './edit-contact-dialog';
import { AddTagDialog } from './dialogs/AddTag';
import { AddNoteDialog } from './dialogs/AddNote';
import {
  useContactTags,
  useContactNotes,
  useTags,
  useRemoveTagFromContact,
  useDeleteContactNote,
  useCreateContact,
} from '../hooks';
import type { Contact } from '../types/contact';

interface ContactDetailsProps {
  contact: Contact;
  onContactUpdated: () => void;
  onClose?: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  lead: { bg: 'bg-muted', text: 'text-muted-foreground' },
  open: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  customer: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  closed: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

const sourceIcons: Record<string, string> = {
  whatsapp: '📱',
  facebook: 'f',
  instagram: '📷',
  web: '🌐',
};

export function ContactDetails({ contact, onContactUpdated, onClose }: ContactDetailsProps) {
  const [notesUpdated, setNotesUpdated] = useState(0);
  const [tagsUpdated, setTagsUpdated] = useState(0);
  const [activeTab, setActiveTab] = useState<'tags' | 'custom' | 'notes'>('tags');

  // Check if this is a real contact (has valid UUID) or a visitor
  const isRealContact = Boolean(
    contact?.id &&
      contact.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  );

  // Use hooks instead of chat-store functions
  const { data: contactTags = [], isLoading: tagsLoading } = useContactTags(
    isRealContact ? contact.id || '' : '',
    () => isRealContact
  );
  const { data: contactNotes = [], isLoading: notesLoading } = useContactNotes(
    isRealContact ? contact.id || '' : '',
    () => isRealContact
  );
  const { data: allTags = [] } = useTags(() => isRealContact);

  const removeTagMutation = useRemoveTagFromContact();
  const deleteNoteMutation = useDeleteContactNote();
  const createContactMutation = useCreateContact();

  const handleRemoveTag = (tagId: string) => {
    if (!contact.id) return;
    removeTagMutation.mutate(
      { contactId: contact.id, tagId },
      {
        onSuccess: () => {
          setTagsUpdated((prev) => prev + 1);
          onContactUpdated();
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId, {
      onSuccess: () => {
        setNotesUpdated((prev) => prev + 1);
        onContactUpdated();
      },
    });
  };

  const handleConvertToOpportunity = () => {
    // TODO: Implementar conversión a oportunidad
    console.log('Convirtiendo contacto a oportunidad:', contact.id);
  };

  const handleEditContact = () => {
    // TODO: Implementar edición de contacto
    console.log('Editando contacto:', contact.id);
  };

  const handleCreateRealContact = () => {
    // Crear contacto real a partir de los datos del visitante
    const contactData = {
      name: contact.name || 'Sin nombre',
      email: contact.email,
      phone: contact.phone,
      wa_id: contact.wa_id,
      fb_id: contact.fb_id,
      ig_id: contact.ig_id,
      source: contact.source || 'web',
      avatar_url: contact.avatar_url,
      status: 'lead' as const,
    };

    createContactMutation.mutate(contactData, {
      onSuccess: () => {
        // El contacto se creó exitosamente, llamar a onContactUpdated para refrescar
        onContactUpdated();
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-background border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-foreground">Detalles del Contacto</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {!isRealContact ? (
            /* Visitor Contact - Show creation option */
            <div className="text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={contact.avatar_url || '/placeholder.svg'} />
                <AvatarFallback className="text-lg">
                  {contact.name?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {contact.name || 'Visitante'}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Este es un contacto temporal. Para gestionar etiquetas, notas y campos
                  personalizados, necesitas crear un contacto real.
                </p>
                <Button
                  className="w-full"
                  onClick={handleCreateRealContact}
                  disabled={createContactMutation.isPending}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {createContactMutation.isPending ? 'Creando...' : 'Crear Contacto Real'}
                </Button>
              </div>
            </div>
          ) : (
            /* Real Contact - Show full details */
            <>
              {/* Avatar and Basic Info */}
              <div className="text-center border-b border-border pb-6">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={contact.avatar_url || '/placeholder.svg'} />
                  <AvatarFallback className="text-lg">
                    {contact.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {contact.name || 'Sin nombre'}
                </h2>

                {/* Status Badge */}
                <div
                  className={cn(
                    statusColors[contact.status || 'lead'].bg,
                    'inline-block rounded px-2 py-1'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      statusColors[contact.status || 'lead'].text
                    )}
                  >
                    {(contact.status || 'lead').charAt(0).toUpperCase() +
                      (contact.status || 'lead').slice(1)}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Información de Contacto
                </h4>

                {/* Email */}
                {contact.email && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Correo</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {contact.phone && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Teléfono</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp ID */}
                {contact.wa_id && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">WhatsApp</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{contact.wa_id}</span>
                    </div>
                  </div>
                )}

                {/* Facebook ID */}
                {contact.fb_id && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Facebook ID
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <Link2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{contact.fb_id}</span>
                    </div>
                  </div>
                )}

                {/* Instagram ID */}
                {contact.ig_id && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Instagram ID
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <Link2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{contact.ig_id}</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Source and Dates */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Información
                </h4>

                {contact.source && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Fuente</label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg">{sourceIcons[contact.source] || '•'}</span>
                      <span className="text-sm">
                        {contact.source.charAt(0).toUpperCase() + contact.source.slice(1)}
                      </span>
                    </div>
                  </div>
                )}

                {contact.created_at && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Fecha de Registro
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(contact.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                )}

                {contact.last_interaction && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Última Interacción
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(contact.last_interaction).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Simple Tabs with Buttons */}
              <div className="space-y-4">
                <div className="flex gap-1 bg-muted p-1 rounded">
                  <Button
                    variant={activeTab === 'tags' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveTab('tags')}
                  >
                    Etiquetas
                  </Button>
                  <Button
                    variant={activeTab === 'custom' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveTab('custom')}
                  >
                    Campos
                  </Button>
                  <Button
                    variant={activeTab === 'notes' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveTab('notes')}
                  >
                    Notas
                  </Button>
                </div>

                {/* Tags */}
                {activeTab === 'tags' && (
                  <div className="space-y-3">
                    {tagsLoading ? (
                      <p className="text-xs text-muted-foreground">Cargando etiquetas...</p>
                    ) : contactTags.length > 0 ? (
                      <div className="space-y-2">
                        {contactTags.map((contactTag) => (
                          <div
                            key={contactTag.id}
                            className="flex items-center justify-between p-2 rounded bg-muted"
                          >
                            <Badge
                              className="text-xs text-white"
                              style={{ backgroundColor: contactTag.mkt_tags?.color }}
                            >
                              {contactTag.mkt_tags?.name}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveTag(contactTag.tag_id)}
                              disabled={removeTagMutation.isPending}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin etiquetas</p>
                    )}
                    <AddTagDialog
                      contactId={contact.id || ''}
                      currentTags={contactTags.map((ct) => ct.mkt_tags).filter(Boolean)}
                      onTagAdded={() => setTagsUpdated((prev) => prev + 1)}
                    />
                  </div>
                )}

                {/* Custom Fields */}
                {activeTab === 'custom' && (
                  <div className="space-y-3">
                    {contact.custom_fields && Object.keys(contact.custom_fields).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(contact.custom_fields).map(([key, value]) => (
                          <div key={key} className="bg-muted p-2 rounded">
                            <p className="text-xs font-semibold text-muted-foreground capitalize">
                              {key}
                            </p>
                            <p className="text-sm text-foreground">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin campos personalizados</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {activeTab === 'notes' && (
                  <div className="space-y-3">
                    {notesLoading ? (
                      <p className="text-xs text-muted-foreground">Cargando notas...</p>
                    ) : contactNotes.length > 0 ? (
                      <div className="space-y-3">
                        {contactNotes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-muted p-3 rounded-lg border-l-4 border-primary relative"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 absolute top-2 right-2"
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={deleteNoteMutation.isPending}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground mb-1">
                              {note.created_at
                                ? new Date(note.created_at).toLocaleDateString('es-ES')
                                : 'Fecha desconocida'}
                            </p>
                            <p className="text-sm text-foreground pr-6">{note.note}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin notas</p>
                    )}
                    <AddNoteDialog
                      contactId={contact.id || ''}
                      onNoteAdded={() => setNotesUpdated((prev) => prev + 1)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {isRealContact && (
        <div className="p-4 border-t border-border space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleEditContact}>
              Editar
            </Button>
            <Button variant="outline" onClick={handleConvertToOpportunity}>
              <Target className="w-4 h-4 mr-2" />
              Oportunidad
            </Button>
          </div>
          {/* <EditContactDialog contact={contact} onContactUpdated={onContactUpdated} /> */}
          <p className="text-xs text-muted-foreground">Funciones de edición próximamente</p>
        </div>
      )}
    </div>
  );
}
