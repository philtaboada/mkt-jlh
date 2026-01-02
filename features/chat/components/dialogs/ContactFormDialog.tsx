'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SelectOptions from '@/components/shared/select-options';
import { Plus, X } from 'lucide-react';
import { Contact } from '../../types';

type ContactStatus = 'lead' | 'open' | 'customer' | 'closed';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contact: {
    name: string;
    email?: string;
    phone?: string;
    wa_id?: string;
    fb_id?: string;
    ig_id?: string;
    status: ContactStatus;
    source: string;
    avatar_url?: string;
    custom_fields?: Record<string, any>;
  }) => void;
  isLoading: boolean;
  mode: 'create' | 'edit'; // create: desde conversación, edit: módulo contactos
  prefilledData?: Partial<Contact>;
  conversationId?: string; // Si viene, se vinculará automáticamente
}

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'open', label: 'Abierto' },
  { value: 'customer', label: 'Cliente' },
  { value: 'closed', label: 'Cerrado' },
];

const sourceOptions = [
  { value: 'web', label: 'Web' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral', label: 'Referencia' },
  { value: 'other', label: 'Otro' },
];

export function ContactFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  mode,
  prefilledData,
  conversationId,
}: ContactFormDialogProps) {
  const isEditMode = mode === 'edit';
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: prefilledData?.phone || '',
    wa_id: prefilledData?.wa_id || '',
    fb_id: prefilledData?.fb_id || '',
    ig_id: prefilledData?.ig_id || '',
    status: (prefilledData?.status as ContactStatus) || 'lead',
    source: prefilledData?.source || 'web',
  });

  const [customFields, setCustomFields] = useState<Record<string, any>>(
    prefilledData?.custom_fields || {}
  );
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const handleAddCustomField = () => {
    if (newFieldKey.trim()) {
      setCustomFields((prev) => ({
        ...prev,
        [newFieldKey]: newFieldValue,
      }));
      setNewFieldKey('');
      setNewFieldValue('');
    }
  };

  const handleRemoveCustomField = (key: string) => {
    setCustomFields((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      status: formData.status,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: prefilledData?.name || '',
      email: prefilledData?.email || '',
      phone: prefilledData?.phone || '',
      wa_id: prefilledData?.wa_id || '',
      fb_id: prefilledData?.fb_id || '',
      ig_id: prefilledData?.ig_id || '',
      status: (prefilledData?.status as ContactStatus) || 'lead',
      source: prefilledData?.source || 'web',
    });
    setCustomFields(prefilledData?.custom_fields || {});
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar contacto' : 'Crear nuevo contacto'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Actualiza los datos del contacto.'
              : conversationId
                ? 'Los campos están pre-rellenados con la información de la conversación. Puedes editarlos y agregar campos personalizados.'
                : 'Crea un nuevo contacto con información básica y campos personalizados.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Información Básica</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Nombre del contacto"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+51 999 888 777"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* IDs de redes sociales - solo si hay valores */}
          {(formData.wa_id || formData.fb_id || formData.ig_id) && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">IDs de Redes Sociales</h4>
                <div className="space-y-3 bg-muted/50 p-3 rounded-lg">
                  {formData.wa_id && (
                    <div className="space-y-2">
                      <Label htmlFor="wa_id" className="text-xs text-muted-foreground">
                        WhatsApp ID
                      </Label>
                      <Input
                        id="wa_id"
                        value={formData.wa_id}
                        readOnly
                        className="bg-background text-sm font-mono cursor-not-allowed opacity-80"
                      />
                    </div>
                  )}
                  {formData.fb_id && (
                    <div className="space-y-2">
                      <Label htmlFor="fb_id" className="text-xs text-muted-foreground">
                        Facebook ID
                      </Label>
                      <Input
                        id="fb_id"
                        value={formData.fb_id}
                        readOnly
                        className="bg-background text-sm font-mono cursor-not-allowed opacity-80"
                      />
                    </div>
                  )}
                  {formData.ig_id && (
                    <div className="space-y-2">
                      <Label htmlFor="ig_id" className="text-xs text-muted-foreground">
                        Instagram ID
                      </Label>
                      <Input
                        id="ig_id"
                        value={formData.ig_id}
                        readOnly
                        className="bg-background text-sm font-mono cursor-not-allowed opacity-80"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Estado y Fuente */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Clasificación</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <SelectOptions
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({ ...formData, status: (value as ContactStatus) || 'lead' })
                  }
                  placeholder="Selecciona estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Fuente</Label>
                <SelectOptions
                  options={sourceOptions}
                  value={formData.source}
                  onChange={(value) =>
                    setFormData({ ...formData, source: (value as string) || 'web' })
                  }
                  placeholder="Selecciona fuente"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Campos personalizados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Campos Personalizados</h4>
              {Object.keys(customFields).length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {Object.keys(customFields).length} campo(s)
                </span>
              )}
            </div>

            {/* Lista de campos personalizados */}
            {Object.keys(customFields).length > 0 && (
              <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                {Object.entries(customFields).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 bg-background rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground capitalize">{key}</p>
                      <p className="text-sm text-muted-foreground truncate">{String(value)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomField(key)}
                      className="ml-2 h-6 w-6 p-0 hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar nuevo campo */}
            <div className="space-y-3 p-3 border border-dashed rounded-lg">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Label htmlFor="field-key" className="text-xs">
                    Campo
                  </Label>
                  <Input
                    id="field-key"
                    placeholder="Ej: empresa"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="field-value" className="text-xs">
                    Valor
                  </Label>
                  <Input
                    id="field-value"
                    placeholder="Ej: Mi Empresa S.A."
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomField}
                disabled={!newFieldKey.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar campo
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim() || isLoading}>
            {isLoading
              ? isEditMode
                ? 'Guardando...'
                : 'Creando...'
              : isEditMode
                ? 'Guardar cambios'
                : 'Crear contacto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
