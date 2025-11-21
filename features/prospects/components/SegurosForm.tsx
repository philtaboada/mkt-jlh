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
import { InsuranceType } from '@/lib/constants/insuranceTypeConstans';
import { TypeInsurance } from '@/lib/enums/insuranceTypeEnums';
import { useFieldArray } from 'react-hook-form';
import { InsuranceFieldsSection } from './InsuranceFieldsSection';
import { Lead } from '@/features/leads/types/leads';
import { generateUUID } from '@/lib/utils/uuidTRandom';
import { HistoryLog } from '@/lib/utils/historyLog';
import { convertUTCToLocal } from '@/lib/utils/dateFormat';
import { LeadProductTypeEnum } from '@/features/leads/types/leadEnums';

interface SegurosFormData {
  id: string;
  project_name: string; //proeject name added
  email: string;
  department: string;
  document_name: string;
  business_name: string;
  phone: string;
  address: string;
  observation: string;
  emition_at: string;
  effective_start_date: string;
  type_entity: 'business' | 'partnership';
  partnership_id: string | null;
  business_id: string | null; //insurnace
  management_date: string;
  worker_id: string; //ambos
  reference_value: number;
  insurance_types: string[];
  referral_channel?: string;
  document_type: string;
  main_product_id?: string;
  business_or_partnership_id: string;
  status_code: 112;
  insurances: {
    insurance_type: string;
    process_type: string;
    coverage_type: string;
    certifier_id: string;
    premium: number;
    sum_assured: number;
    deductible: number;
    observations: string;
  }[];
}

interface SegurosFormProps {
  defaultValues?: Lead | null;
  type: 'add' | 'new';
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export function SegurosForm({ defaultValues, type, onSubmit, onCancel }: SegurosFormProps) {
  const { data: workers = [], isLoading: workersLoading } = useWorkers();
  const today = new Date().toISOString().slice(0, 10);
  const mainProductId = generateUUID();

  const mapTypeEntity = (type?: any): 'business' | 'partnership' => {
    if (type === 'partnerships') return 'partnership';
    if (type === 'partnership') return 'partnership';
    if (type === 'business') return 'business';
    return 'business';
  };

  const form = useForm<SegurosFormData>({
    defaultValues: defaultValues
      ? {
          project_name: '', // insurance
          email: defaultValues.email || '',
          document_type: 'RUC', //insurance
          department: 'LIMA', //insurance
          document_name: defaultValues.ruc || '', // insurance
          business_name: defaultValues.business_or_person_name || '',
          phone: defaultValues.phone || defaultValues.whatsapp || '', //isunrance
          address: '', //insurance
          observation: defaultValues.notes || '', //insurance
          emition_at: today, //insurance
          effective_start_date: today,
          type_entity: mapTypeEntity(defaultValues.type_entity),
          business_or_partnership_id: defaultValues.business_or_partnership_id || undefined,
          partnership_id:
            mapTypeEntity(defaultValues.type_entity) === 'partnership'
              ? defaultValues.business_or_partnership_id
              : null,
          business_id:
            mapTypeEntity(defaultValues.type_entity) === 'business'
              ? defaultValues.business_or_partnership_id
              : null,
          management_date: today,
          worker_id: defaultValues.assigned_user?.id || '', //ambos
          main_product_id: mainProductId,
          reference_value: defaultValues.estimated_value || 0, //ambos
          referral_channel: 'Marketing',
          insurance_types: [],
          insurances: [],
          status_code: 112,
        }
      : {
          project_name: '',
          email: '',
          department: 'LIMA',
          document_name: '',
          business_name: '',
          phone: '',
          address: '',
          observation: '',
          emition_at: today,
          effective_start_date: today,
          type_entity: 'business',
          business_id: null,
          partnership_id: null,
          management_date: '',
          worker_id: '',
          reference_value: 0,
          insurance_types: [],
          insurances: [],
        },
  });

  const {
    fields: insuranceFields,
    append: appendInsurance,
    remove: removeInsurance,
  } = useFieldArray({
    control: form.control,
    name: 'insurances',
  });

  const handleInsuranceTypeChange = (selectedTypes: string[]) => {
    const currentInsurances = form.getValues('insurances') || [];
    const existingTypes = currentInsurances.map((insurance: any) => insurance.insurance_type);

    // Agregar nuevos tipos seleccionados
    selectedTypes.forEach((type) => {
      if (!existingTypes.includes(type)) {
        const insuranceData: any = {
          insurance_type: type,
          process_type: '',
        };

        // Agregar campos específicos según el tipo
        if (type === TypeInsurance.SOAT) {
          insuranceData.license_plate_number = '';
          insuranceData.type_of_use = '';
          insuranceData.year_of_manufacture = '';
        } else if (type === TypeInsurance.VEHICULAR) {
          insuranceData.insured_amount = '';
          insuranceData.type_of_use = '';
          insuranceData.license_plate_number = '';
        } else if (type === TypeInsurance.SCTR) {
          insuranceData.coverage_of_type = '';
        }

        appendInsurance(insuranceData);
      }
    });

    // Remover tipos no seleccionados
    const indicesToRemove: number[] = [];
    currentInsurances.forEach((insurance: any, index: number) => {
      if (!selectedTypes.includes(insurance.insurance_type)) {
        indicesToRemove.push(index);
      }
    });

    // Remover en orden inverso para mantener índices correctos
    indicesToRemove.reverse().forEach((index) => {
      removeInsurance(index);
    });

    // Actualizar validaciones de campos de contacto
    updateContactFieldsValidation(selectedTypes);
  };

  const updateContactFieldsValidation = (selectedTypes: string[]) => {
    const typesRequiringContact = [
      TypeInsurance.POLIZA_CAR,
      TypeInsurance.POLIZA_TREC,
      TypeInsurance.POLIZA_EAR,
      TypeInsurance.POLIZA_MULTIRRIESGO,
      TypeInsurance.R_CIVIL,
    ];
    const requiresContact = selectedTypes.some((type) =>
      typesRequiringContact.includes(type as TypeInsurance)
    );

    // Aquí podríamos agregar validaciones dinámicas si fuera necesario
    // Por ahora solo marcamos que algunos tipos requieren contacto
  };

  const handleSubmit = async (values: any) => {
    const formattedValues = {
      ...values,
      emition_at: values.emition_at ? convertUTCToLocal(values.emition_at) : null,
      effective_start_date: values.effective_start_date
        ? convertUTCToLocal(values.effective_start_date)
        : null,
      management_date: values.management_date ? convertUTCToLocal(values.management_date) : null,
    };

    const products = formattedValues.insurances.map((insurance: any) => ({
      id: generateUUID(),
      type: 'Seguros',
      insurance_type: insurance.insurance_type,
      status_code: 112,
    }));

    const {
      insurances,
      insurance_types,
      main_product_id,
      management_date,
      business_or_partnership_id,
      effective_start_date,
      partnership_id,
      referral_channel,
      type_entity,
      ...rest
    } = formattedValues;

    const updatedInsurances = formattedValues.insurances.map((insurance: any, index: number) => ({
      ...insurance,
      ...rest,
      id: products[index].id,
    }));

    const histories = products.map((product: any) =>
      HistoryLog({
        action: 'create',
        entity_type: 'insurances_prospects',
        entity_id: product.id,
        description: `Producto Seguro creado: ${product.insurance_type}`,
        value: JSON.stringify(product),
      })
    );
    const payload = {
      ...formattedValues,
      insurances: updatedInsurances,
      products,
      mkt_lead_id: defaultValues?.id || null,
      histories,
      type: 'new',
    };
    await onSubmit({
      payload,
      type: LeadProductTypeEnum.SEGUROS,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Razón social */}
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
            name="document_name"
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
        {/* Nombre del producto */}
        <FormField
          control={form.control}
          name="project_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Monto y Fecha de Emisión */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="reference_value"
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

          <FormField
            control={form.control}
            name="effective_start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha inicio vigencia</FormLabel>
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

        {/* seguro y Personal Asignado */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="insurance_types"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipos de Seguro</FormLabel>
                <FormControl>
                  <SelectOptions
                    placeholder="Selecciona los tipos de seguro"
                    items={InsuranceType}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      handleInsuranceTypeChange(
                        Array.isArray(value) ? value : value ? [value] : []
                      );
                    }}
                    multiple={true}
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

        {/* Campos específicos por tipo de seguro */}
        <InsuranceFieldsSection control={form.control} fields={insuranceFields} />

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
