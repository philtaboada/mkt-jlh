'use client';

import * as React from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useWorkers } from '@/hooks/useWorkers';
import {
  useCompanies,
  useCreateCompany,
  useSearchCompanies,
} from '@/features/companies/hooks/useCompanies';
import {
  usePartnerships,
  useCreatePartnership,
  useSearchPartnerships,
} from '@/features/partnerships/hooks/usePartnerships';
import SelectOptions from '../../../components/shared/select-options';
import { SaveAll, X } from 'lucide-react';
import { CompanyForm } from '../../companies/components/CompanyForm';
import { EntityDialog } from '../../../components/shared/dialogs/EntityDialog';
import { LeadFormInput, leadFormSchema } from '../schemas/leadSchemas';
import { LeadEntityTypeOptions, LeadSourceOptions, LeadStatusOptions } from '../types/leadLabels';
import { PlatformLabels } from '../types/platformLabels';
import { PartnershipForm } from '@/features/partnerships/components/PartnershipForm';
import { LeadEntityTypeEnum } from '../types/leadEnums';
import { de } from 'date-fns/locale';

interface LeadFormProps {
  defaultValues?: LeadFormInput;
  onSubmit: (data: LeadFormInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function LeadForm({ defaultValues, onSubmit, onCancel }: LeadFormProps) {
  const { data: workers, isLoading: isWorkersLoading } = useWorkers();

  // Estado para buscar
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedTerm, setDebouncedTerm] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Debounce (400ms)
  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(searchTerm), 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultValues || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      job_title: null,
      type_entity: LeadEntityTypeEnum.BUSINESS,
      business_or_partnership_id: null,
      business_or_person_name: null,
      ruc: '',
      status: 'new',
      source: 'website',
      platform: undefined,
      score: 50,
      estimated_value: undefined,
      last_contact_date: undefined,
      next_follow_up: undefined,
      assigned_to: undefined,
      tags: undefined,
      notes: '',
    },
  });

  const typeEntity = form.watch('type_entity');

  const source = form.watch('source');

  const { handleSubmit, formState } = form;

  // Queries para datos iniciales
  const { data: initialCompanies, isLoading: isLoadingInitialCompanies } = useCompanies({
    pageIndex: 0,
    pageSize: 10,
    search: '',
  });
  const { data: initialPartnerships, isLoading: isLoadingInitialPartnerships } = usePartnerships({
    pageIndex: 0,
    pageSize: 10,
    search: '',
  });

  // Queries de búsqueda
  const { data: companyResults = [], isFetching: isFetchingCompanies } = useSearchCompanies(
    debouncedTerm,
    typeEntity === 'business'
  );

  const { data: partnershipResults = [], isFetching: isFetchingPartnerships } =
    useSearchPartnerships(debouncedTerm, typeEntity === LeadEntityTypeEnum.PARTNERSHIPS);

  const createCompanyMutation = useCreateCompany();
  const createPartnershipMutation = useCreatePartnership();

  const submit = async (values: LeadFormInput) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('❌ Error in onSubmit:', error);
    }
  };

  return (
    <>
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

          {/* Cargo */}
         {/*  <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="CEO, Gerente, etc." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />  */}

          {/* Tipo de producto y entidad */}
          <div className="grid grid-cols-2 gap-4">
            {/* Asignar a */}
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal</FormLabel>
                  <FormControl>
                    <SelectOptions
                      disabled={!!defaultValues?.assigned_to}
                      items={workers || []}
                      valueKey="id"
                      labelKey="name"
                      subtitleKey="email"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v)}
                      placeholder="Selecciona personal"
                      searchable
                      loading={isWorkersLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    onChange={(v) => {
                      field.onChange(v);
                      form.setValue('business_or_partnership_id', null); // reset id al cambiar tipo
                      form.setValue('business_or_person_name', null); // reset name al cambiar tipo
                      form.setValue('ruc', ''); // reset ruc al cambiar tipo
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Empresa o Consorcio */}
          <FormField
            control={form.control}
            name="business_or_partnership_id"
            render={({ field }) => {
              // Combinar items con el elemento seleccionado por defecto si no está en la lista
              const baseItems = debouncedTerm
                ? typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                  ? partnershipResults
                  : companyResults
                : typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                  ? initialPartnerships?.data || []
                  : initialCompanies?.data || [];

              let combinedItems = baseItems;

              // Si hay un valor seleccionado y no está en la lista, agregarlo
              if (field.value && !baseItems.find((item: any) => item.id === field.value)) {
                const selectedItem = {
                  id: field.value,
                  [typeEntity === LeadEntityTypeEnum.PARTNERSHIPS ? 'name' : 'legal_name']:
                    defaultValues?.business_or_person_name || '',
                  document: defaultValues?.ruc || '',
                };
                combinedItems = [selectedItem, ...baseItems];
              }

              return (
                <FormItem>
                  <FormLabel>Empresa o Consorcio</FormLabel>
                  <FormControl>
                    <SelectOptions
                      items={combinedItems}
                      valueKey="id"
                      labelKey={
                        typeEntity === LeadEntityTypeEnum.PARTNERSHIPS ? 'name' : 'legal_name'
                      }
                      subtitleKey="document"
                      value={field.value ?? null}
                      onChange={(v) => {
                        field.onChange(v);
                        // Auto-poblar business_or_person_name con el nombre seleccionado
                        if (v) {
                          const selectedItem = combinedItems.find((item: any) => item.id === v);
                          if (selectedItem) {
                            const name =
                              typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                                ? selectedItem.name
                                : selectedItem.legal_name;
                            form.setValue('business_or_person_name', name);
                            form.setValue('ruc', selectedItem.document);
                          }
                        } else {
                          form.setValue('business_or_person_name', null);
                          form.setValue('ruc', '');
                        }
                      }}
                      placeholder={
                        typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                          ? 'Selecciona un consorcio'
                          : 'Selecciona una empresa'
                      }
                      searchable
                      loading={
                        debouncedTerm
                          ? typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                            ? isFetchingPartnerships
                            : isFetchingCompanies
                          : typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                            ? isLoadingInitialPartnerships
                            : isLoadingInitialCompanies
                      }
                      createOption={{
                        label:
                          typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
                            ? 'Crear nuevo consorcio'
                            : 'Crear nueva empresa',
                        onCreate: () => setCreateDialogOpen(true),
                      }}
                      onSearch={(term) => setSearchTerm(term)}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Estado y Fuente */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <SelectOptions
                    disabled={defaultValues?.status === 'deals'}
                    placeholder="Selecciona el estado"
                    options={LeadStatusOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente *</FormLabel>
                  <SelectOptions
                    placeholder="Selecciona la fuente"
                    options={LeadSourceOptions}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value !== 'social_media') {
                        form.setValue('platform', undefined);
                      }
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Plataforma (solo si fuente es redes sociales) */}
          {source === 'social_media' && (
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plataforma</FormLabel>
                  <SelectOptions
                    placeholder="Selecciona la plataforma"
                    options={Object.entries(PlatformLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Valor Estimado */}
          <FormField
            control={form.control}
            name="estimated_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Estimado (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10000"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Valor estimado del negocio en dólares</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="last_contact_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Último Contacto</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_follow_up"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próximo Seguimiento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Score */}
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score de Lead: {String(field.value)}</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>Califica la calidad del lead del 0 al 100</FormDescription>
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
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4" /> Cancelar
              </Button>
            )}
            <Button type="submit" disabled={formState.isSubmitting}>
              <SaveAll className="h-4 w-4" />
              {formState.isSubmitting ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal para crear Empresa o Consorcio */}
      <EntityDialog
        title={
          typeEntity === LeadEntityTypeEnum.PARTNERSHIPS
            ? 'Crear Nuevo Consorcio'
            : 'Crear Nueva Empresa'
        }
        content={(onClose) =>
          typeEntity === LeadEntityTypeEnum.PARTNERSHIPS ? (
            <PartnershipForm
              defaultValues={{ document: debouncedTerm || '' } as any}
              onSubmit={async (data) => {
                await createPartnershipMutation.mutateAsync(data);
                onClose();
              }}
              onCancel={onClose}
            />
          ) : (
            <CompanyForm
              defaultValues={{ document: debouncedTerm || '' } as any}
              onSubmit={async (data) => {
                await createCompanyMutation.mutateAsync(data);
                onClose();
              }}
              onCancel={onClose}
            />
          )
        }
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        maxWidth="4xl"
      />
    </>
  );
}
