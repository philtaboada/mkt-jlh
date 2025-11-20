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
import { useCertifiers } from '@/hooks/useCertifiers';
import { Departaments } from '@/lib/constants/departmentConstants';
import { IsoTypeRecord } from '@/lib/constants/isosConstants';
import { Lead } from '@/features/leads/types/leads';
import { HistoryLog } from '@/lib/utils/historyLog';
import { generateUUID } from '@/lib/utils/uuidTRandom';
import { LeadProductTypeEnum } from '@/features/leads/types/leadEnums';

interface IsosFormProps {
  defaultValues?: Lead | null;
  type?: 'new' | 'add';
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export function IsosForm({ defaultValues, type, onSubmit, onCancel }: IsosFormProps) {
  const { data: workers = [], isLoading: workersLoading } = useWorkers();
  const { data: certifiersData, isLoading: certifiersLoading } = useCertifiers();
  const today = new Date().toISOString().split('T')[0];
  const productId = generateUUID();
  const mainProductId = generateUUID();
  const product = {
    id: productId,
    type: 'Isos',
    status_code: 112,
  };
  const products = [product];
  const description =
    type === 'add' ? 'Añadido nuevo ISOS al prospecto' : 'Creado nuevo prospecto ISOS';
  const history = HistoryLog({
    action: 'create',
    entity_type: 'isos_prospects',
    entity_id: productId,
    description: `${description} - ${defaultValues?.business_or_person_name || ''}`,
    value: JSON.stringify({ defaultValues }),
  });

  const form = useForm({
    defaultValues: defaultValues
      ? {
          email: defaultValues.email || '',
          department: 'LIMA',
          ruc: defaultValues.ruc || '',
          business_name: defaultValues.business_or_person_name || '',
          business_or_person_name: defaultValues.business_or_person_name || '',
          phone: defaultValues.phone || defaultValues.whatsapp || '',
          business_id: defaultValues.business_or_partnership_id,
          address: '',
          observation: defaultValues.notes || '',
          emition_at: today,
          business_or_partnership_id: defaultValues.business_or_partnership_id,
          referral_channel: 'Marketing',
          type_entity: 'business',
          management_date: today,
          worker_id: defaultValues.assigned_user?.id || null,
          main_product_id: mainProductId,
          amount: defaultValues.estimated_value || 0,
          certifier_id: null,
          types: [],
          status_code: 112,
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
    await onSubmit({ payload, type: LeadProductTypeEnum.ISOS });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Razón Social */}
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razón Social *</FormLabel>
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

        {/* Monto */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personal Certificador y Personal Asignado */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="certifier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificador</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder={
                      certifiersLoading
                        ? 'Cargando certificadores...'
                        : 'Selecciona el certificador'
                    }
                    items={certifiersData ?? []}
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

          <FormField
            control={form.control}
            rules={{ required: 'Este campo es requerido' }}
            name="worker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Asignado</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder={
                      workersLoading
                        ? 'Cargando trabajadores...'
                        : 'Selecciona el personal asignado'
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
        </div>

        {/* Tipo de ISOS (Multiselect) */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="types"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de ISOS</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder="Selecciona los tipos de ISOS"
                    items={IsoTypeRecord}
                    value={field.value}
                    searchable={true}
                    onChange={(value) => field.onChange(value)}
                    multiple={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de Emisión */}
          <FormField
            control={form.control}
            name="emition_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Emisión</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value || today}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
