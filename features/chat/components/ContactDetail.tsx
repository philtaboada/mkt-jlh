'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Smartphone, Calendar, Link2, X, UserPlus, Target, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTagDialog } from './dialogs/AddTag';
import { AddNoteDialog } from './dialogs/AddNote';
import { ContactFormDialog } from './dialogs/ContactFormDialog';
import { AddConvertLead } from './dialogs/AddConvertLead';
import {
  useContactTags,
  useContactNotes,
  useTags,
  useRemoveTagFromContact,
  useDeleteContactNote,
  useCreateContact,
  useUpdateContact,
  useUpdateConversationContact,
} from '../hooks';
import type { Contact } from '../types/contact';

interface ContactDetailsProps {
  contact: Contact;
  conversationId?: string;
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

export function ContactDetails({
  contact,
  conversationId,
  onContactUpdated,
  onClose,
}: ContactDetailsProps) {
  const [notesUpdated, setNotesUpdated] = useState(0);
  const [tagsUpdated, setTagsUpdated] = useState(0);
  const [activeTab, setActiveTab] = useState<'tags' | 'custom' | 'notes'>('tags');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConvertLeadDialog, setShowConvertLeadDialog] = useState(false);
  const [displayContact, setDisplayContact] = useState<Contact>(contact);

  useEffect(() => {
    setDisplayContact(contact);
  }, [contact]);

  const isRealContact = Boolean(
    displayContact?.id &&
      displayContact.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  );

  const { data: contactTags = [], isLoading: tagsLoading } = useContactTags(contact.id || '');
  const { data: contactNotes = [], isLoading: notesLoading } = useContactNotes(contact.id || '');
  const { data: allTags = [] } = useTags();

  const removeTagMutation = useRemoveTagFromContact();
  const deleteNoteMutation = useDeleteContactNote();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const updateConversationMutation = useUpdateConversationContact();

  const handleRemoveTag = (tagId: string) => {
    if (!displayContact.id) return;
    removeTagMutation.mutate(
      { contactId: displayContact.id, tagId },
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

  const handleCreateRealContact = () => {
    setShowCreateDialog(true);
  };

  const handleSubmitCreateContact = (contactData: any) => {
    console.log('handleSubmitCreateContact: contactData=', contactData);
    createContactMutation.mutate(contactData, {
      onSuccess: (newContact: any) => {
        console.log('handleSubmitCreateContact: onSuccess with newContact=', newContact);
        setShowCreateDialog(false);
        setDisplayContact(newContact);

        if (conversationId && newContact?.id) {
          console.log('Linking conversation', conversationId, 'to contact', newContact.id);
          updateConversationMutation.mutate(
            { conversationId, contactId: newContact.id },
            {
              onSuccess: () => {
                console.log('Conversation linked successfully');
                onContactUpdated();
              },
            }
          );
        } else {
          console.log('No conversationId or newContact.id', {
            conversationId,
            newContactId: newContact?.id,
          });
          onContactUpdated();
        }
      },
    });
  };

  const handleConvertToOpportunity = () => {
    setShowConvertLeadDialog(true);
  };

  const handleEditContact = () => {
    setShowEditDialog(true);
  };

  const handleSubmitEditContact = (contactData: any) => {
    if (!displayContact.id) return;

    updateContactMutation.mutate(
      { id: displayContact.id, updates: contactData },
      {
        onSuccess: (updatedContact: any) => {
          setShowEditDialog(false);
          setDisplayContact(updatedContact);
          onContactUpdated();
        },
      }
    );
  };

  const handleSubmitConvertLead = async (data: any) => {
    console.log('Convirtiendo contacto a lead:', data);
    // TODO: Implementar creación de lead

    // Marcar el contacto como convertido
    if (displayContact.id) {
      updateContactMutation.mutate(
        { id: displayContact.id, updates: { is_converted_lead: true } },
        {
          onSuccess: () => {
            console.log('Contacto marcado como convertido');
            onContactUpdated();
          },
        }
      );
    }

    setShowConvertLeadDialog(false);
  };

  return (
    <>
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
                  <AvatarImage src={displayContact.avatar_url || '/placeholder.svg'} />
                  <AvatarFallback className="text-lg">
                    {displayContact.name?.charAt(0) || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {displayContact.name || 'Visitante'}
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

                {/* Modal para crear contacto con datos pre-rellenados */}
                <ContactFormDialog
                  mode="create"
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                  onSubmit={handleSubmitCreateContact}
                  isLoading={createContactMutation.isPending}
                  conversationId={conversationId}
                  prefilledData={{
                    name: displayContact.name,
                    email: displayContact.email,
                    phone: displayContact.phone,
                    wa_id: displayContact.wa_id,
                    fb_id: displayContact.fb_id,
                    ig_id: displayContact.ig_id,
                    source: displayContact.source,
                  }}
                />
              </div>
            ) : (
              /* Real Contact - Show full details */
              <>
                {/* Avatar and Basic Info */}
                <div className="text-center border-b border-border pb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={displayContact.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback className="text-lg">
                      {displayContact.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {displayContact.name || 'Sin nombre'}
                  </h2>

                  {/* Status Badge */}
                  <div
                    className={cn(
                      statusColors[displayContact.status || 'lead'].bg,
                      'inline-block rounded px-2 py-1'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-medium',
                        statusColors[displayContact.status || 'lead'].text
                      )}
                    >
                      {(displayContact.status || 'lead').charAt(0).toUpperCase() +
                        (displayContact.status || 'lead').slice(1)}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Información de Contacto
                  </h4>

                  {/* Email */}
                  {displayContact.email && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Correo</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${displayContact.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {displayContact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {displayContact.phone && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Teléfono
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`tel:${displayContact.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {displayContact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp ID */}
                  {displayContact.wa_id && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        WhatsApp
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{displayContact.wa_id}</span>
                      </div>
                    </div>
                  )}

                  {/* Facebook ID */}
                  {displayContact.fb_id && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Facebook ID
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{displayContact.fb_id}</span>
                      </div>
                    </div>
                  )}

                  {/* Instagram ID */}
                  {displayContact.ig_id && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Instagram ID
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{displayContact.ig_id}</span>
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

                  {displayContact.source && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Fuente</label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg">{sourceIcons[displayContact.source] || '•'}</span>
                        <span className="text-sm">
                          {displayContact.source.charAt(0).toUpperCase() +
                            displayContact.source.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {displayContact.created_at && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Fecha de Registro
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(displayContact.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  )}

                  {displayContact.last_interaction && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Última Interacción
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(displayContact.last_interaction).toLocaleDateString('es-ES')}
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
                        contactId={displayContact.id || ''}
                        currentTags={contactTags.map((ct) => ct.mkt_tags).filter(Boolean)}
                        onTagAdded={() => setTagsUpdated((prev) => prev + 1)}
                      />
                    </div>
                  )}

                  {/* Custom Fields */}
                  {activeTab === 'custom' && (
                    <div className="space-y-3">
                      {displayContact.custom_fields &&
                      Object.keys(displayContact.custom_fields).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(displayContact.custom_fields).map(([key, value]) => (
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
                        contactId={displayContact.id || ''}
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
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={handleConvertToOpportunity}
                disabled={displayContact.is_converted_lead}
              >
                <Target className="w-4 h-4 mr-2" />
                {displayContact.is_converted_lead ? 'Ya convertido' : 'Oportunidad'}
              </Button>
            </div>

            {/* Diálogo de edición */}
            <ContactFormDialog
              mode="edit"
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              onSubmit={handleSubmitEditContact}
              isLoading={updateContactMutation.isPending}
              prefilledData={displayContact}
            />
          </div>
        )}
      </div>

      {/* Dialog for Convert to Lead */}
      <AddConvertLead
        open={showConvertLeadDialog}
        onOpenChange={setShowConvertLeadDialog}
        defaultValues={{
          first_name: displayContact.name?.split(' ')[0] || '',
          last_name: displayContact.name?.split(' ').slice(1).join(' ') || '',
          email: displayContact.email || '',
          phone: displayContact.phone || '',
          whatsapp: displayContact.wa_id || '',
          business_or_person_name: displayContact.name || '',
        }}
        onSubmit={handleSubmitConvertLead}
      />
    </>
  );
}
