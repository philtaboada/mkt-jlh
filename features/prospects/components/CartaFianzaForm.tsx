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
import { proyectStatus } from '@/lib/constants/statusGuranteeConstants';
import { Departaments } from '@/lib/constants/departmentConstants';
import { ConstractSubject } from '@/lib/constants/contractSubjectConstants';
import { generateUUID } from '@/lib/utils/uuidTRandom';
import { HistoryLog } from '@/lib/utils/historyLog';
import { Lead } from '@/features/leads/types/leads';
import { LeadEntityTypeEnum, LeadProductTypeEnum } from '@/features/leads/types/leadEnums';
interface CartaFianzaFormProps {
  defaultValues: Lead | null;
  type?: 'new' | 'add';
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export function CartaFianzaForm({ defaultValues, type, onSubmit, onCancel }: CartaFianzaFormProps) {
  console.log('Default types:', type);
  const today = new Date().toISOString().split('T')[0];

  const { data: workers = [], isLoading: workersLoading } = useWorkers();
  const productId = generateUUID();
  const mainProductId = generateUUID();
  const description =
    type === 'new'
      ? `Prospecto Carta Fianza creado con ${defaultValues?.business_or_person_name || ''}`
      : `Añadido nuevo Carta Fianza al prospecto - ${defaultValues?.business_or_person_name || ''}`;
  const history = HistoryLog({
    action: 'create',
    entity_type: 'guarantees_letters_prospects',
    entity_id: productId,
    description: `${description} - ${defaultValues?.business_or_person_name || ''}`,
    value: JSON.stringify({ defaultValues }),
  });
  const form = useForm({
    defaultValues: defaultValues
      ? {
          postor:
            defaultValues?.business_or_person_name ||
            `${defaultValues?.first_name} ${defaultValues.last_name}` ||
            '',
          ruc: defaultValues?.ruc || '',
          department: 'LIMA',
          nomenclatura: '',
          contract_subject: '',
          worker_id: defaultValues?.assigned_user?.id || '',
          type_money: 'Soles',
          stimated_premium: 0,
          stimated_income: 0,
          reference_value: defaultValues?.estimated_value || 0,
          mobile_number: defaultValues?.phone || defaultValues?.whatsapp || '',
          business_or_partnership_id: defaultValues?.business_or_partnership_id || null,
          email: defaultValues?.email || '',
          observation: defaultValues?.notes || '',
          main_product_id: mainProductId,
          awarded_date: today,
          management_date: today,
          type_entity: defaultValues?.type_entity || LeadEntityTypeEnum.BUSINESS,
          status: '',
          status_code: 112,
          referral_channel: 'Marketing',
          priority: 1,
        }
      : {},
  });

  const handleSubmit = async (values: any) => {
    const product = {
      id: productId,
      type: 'Carta Fianza',
      status_code: 112,
      stimated_income: values.stimated_income,
      stimated_premium: values.stimated_premium,
    };
    const products = [product];
    const payload = {
      id: productId,
      ...values,
      products,
      product,
      mkt_lead_id: defaultValues?.id || null,
      history,
      priority: 1,
      type: type,
    };
    await onSubmit({ payload, type: LeadProductTypeEnum.CARTA_FIANZA });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Postor */}
        <FormField
          control={form.control}
          name="postor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postor *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del postor" {...field} />
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

        {/* Nomenclatura y Personal */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nomenclatura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomenclatura</FormLabel>
                <FormControl>
                  <Input placeholder="Nomenclatura del proyecto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="worker_id"
            rules={{ required: 'Este campo es requerido' }}
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
        </div>

        {/* Status y Objeto de contratación */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder="Selecciona el status"
                    options={proyectStatus}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contract_subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objeto de contratación</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder="Selecciona el objeto de contratación"
                    items={ConstractSubject}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tipo de moneda y Valor referencia */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type_money"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de moneda</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder="Selecciona el tipo de moneda"
                    options={[
                      { value: 'Soles', label: 'Soles' },
                      { value: 'Dolares', label: 'Dólares' },
                    ]}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor referencia</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Prima estimada y Honorario estimado */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stimated_premium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prima estimada</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stimated_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Honorario estimado</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Teléfono y Correo */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mobile_number"
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

        {/* Fecha de adjudicación y Fecha de gestión */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="awarded_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de adjudicación</FormLabel>
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
        </div>

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
