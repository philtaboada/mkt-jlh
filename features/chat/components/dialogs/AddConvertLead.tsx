'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SelectOptions from '@/components/shared/select-options';
import { SaveAll, X } from 'lucide-react';
import { LeadFormInput, leadFormSchema } from '@/features/leads/schemas/leadSchemas';
import { LeadEntityTypeEnum } from '@/features/leads/types/leadEnums';
import { LeadEntityTypeOptions } from '@/features/leads/types/leadLabels';

interface AddConvertLeadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<LeadFormInput>;
  onSubmit: (data: LeadFormInput) => Promise<void> | void;
}

export function AddConvertLead({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: AddConvertLeadProps) {
  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      type_entity: LeadEntityTypeEnum.BUSINESS,
      business_or_person_name: '',
      ruc: '',
      status: 'new',
      source: 'website',
      notes: '',
      ...defaultValues,
    },
  });

  const { handleSubmit, formState } = form;

  const submit = async (values: LeadFormInput) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error in onSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Convertir a Lead</DialogTitle>
          <DialogDescription>
            Completa el formulario para convertir este contacto en un lead.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(submit)(e);
            }}
            className="space-y-4"
          >
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teléfonos */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+51 999 000 000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+51 999 000 000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo de Entidad */}
            <FormField
              control={form.control}
              name="type_entity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Entidad</FormLabel>
                  <SelectOptions
                    placeholder="Selecciona el tipo de entidad"
                    options={LeadEntityTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre de Empresa o Persona */}
            <FormField
              control={form.control}
              name="business_or_person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razon Social / Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa XYZ" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RUC */}
            <FormField
              control={form.control}
              name="ruc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (RUC)</FormLabel>
                  <FormControl>
                    <Input placeholder="20...." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                <SaveAll className="h-4 w-4" />
                {formState.isSubmitting ? 'Guardando...' : 'Crear Lead'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
