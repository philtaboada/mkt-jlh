'use client';

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
import { SelectOptions } from '@/components/shared/select-options';
import { useWorkers } from '@/hooks/useWorkers';
import { Departaments } from '@/lib/constants/departmentConstants';
import { generateUUID } from '@/lib/utils/uuidTRandom';
import { HistoryLog } from '@/lib/utils/historyLog';
import { LeadProductTypeEnum } from '@/features/leads/types/leadEnums';
import { Lead } from '@/features/leads/types/leads';

interface FideicomisosFormProps {
  defaultValues?: Lead | null;
  type: 'new' | 'add';
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export function FideicomisosForm({
  defaultValues,
  type,
  onSubmit,
  onCancel,
}: FideicomisosFormProps) {
  const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

  const { data: workers = [], isLoading: workersLoading } = useWorkers();
  const productId = generateUUID();
  const mainProductId = generateUUID();

  const product = {
    id: productId,
    type: 'Fideicomisos',
    status_code: 112,
  };
  const products = [product];
  const description =
    type === 'add' ? 'Añadido nuevo ISOS al prospecto' : 'Creado nuevo prospecto ISOS';
  const history = HistoryLog({
    action: 'create',
    entity_type: 'trust_prospects',
    entity_id: productId,
    description: `${description} - ${defaultValues?.business_or_person_name || ''}`,
    value: JSON.stringify({ defaultValues }),
  });

  const form = useForm({
    defaultValues: defaultValues
      ? {
          business_name: defaultValues.business_or_person_name || '',
          ruc: defaultValues.ruc || '',
          department: 'LIMA',
          email: defaultValues.email || '',
          phone: defaultValues.phone || defaultValues.whatsapp || '',
          address: defaultValues.notes || '',
          worker_id: defaultValues.assigned_user?.id || '',
          observation: defaultValues.notes || '',
          management_date: today,
          main_product_id: mainProductId,
          referral_channel: 'Marketing',
          type_entity: defaultValues.type_entity || 'business',
          business_or_partnership_id: defaultValues.business_or_partnership_id || null,
          status_code: 112,
          effective_start_date: today,
        }
      : {},
  });

  const handleSubmit = async (values: any) => {
    const payload = {
      id: productId,
      ...values,
      products,
      product,
      mkt_lead_id: defaultValues?.id || null,
      history,
      type,
    };
    await onSubmit({ payload, type: LeadProductTypeEnum.FIDEICOMISOS });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Business Name */}
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razón Social</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* RUC y Departamento */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl>
                  <Input placeholder="20123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder="Selecciona un departamento"
                    items={Departaments}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Correo y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input placeholder="email@ejemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+51 999 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dirección */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Textarea placeholder="Dirección completa..." className="min-h-20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personal */}
        <FormField
          control={form.control}
          rules={{ required: 'Este campo es requerido' }}
          name="worker_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal</FormLabel>
              <FormControl>
                <SelectOptions
                  placeholder={
                    workersLoading ? 'Cargando trabajadores...' : 'Selecciona el personal'
                  }
                  items={workers}
                  labelKey="name"
                  valueKey="id"
                  subtitleKey="email"
                  value={field.value}
                  searchable={true}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observaciones */}
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones adicionales..."
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de gestión */}
        <FormField
          control={form.control}
          name="management_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de gestión</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || today}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
