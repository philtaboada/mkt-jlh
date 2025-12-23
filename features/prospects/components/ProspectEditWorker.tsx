'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SelectOptions } from '@/components/shared/select-options';
import { useWorkers } from '@/hooks/useWorkers';
import { Prospect, ProspectProducts } from '@/features/prospects/types/prospects';
import { Worker } from '@/lib/api/worker';
import { Textarea } from '@/components/ui/textarea';
import { UpdateProspectWorkerData } from '@/features/prospects/types/updateWorker';

interface ProspectEditWorkerProps {
  prospect: Prospect;
  onSubmit: (data: UpdateProspectWorkerData) => void;
  onCancel?: () => void;
}

// Mapeo de tipos de producto a entity_type
const mapProductTypeToEntityType = (productType: string): string => {
  const typeMap: Record<string, string> = {
    'Carta Fianza': 'guarantees_letters_prospects',
    Seguros: 'insurance_prospects',
    Fideicomisos: 'trust_prospects',
    Isos: 'iso_prospects',
    'Aumentos de Capital': 'capitalincreases_prospects',
    'Línea de Crédito': 'line_of_credit_prospects',
  };
  return typeMap[productType] || 'prospects';
};

const editWorkerSchema = z.object({
  worker_id: z.string().min(1, 'Debe seleccionar un worker'),
  observation: z.string().optional(),
  product_id: z.string().min(1, 'Debe seleccionar un producto'),
});

type EditWorkerFormData = z.infer<typeof editWorkerSchema>;

export function ProspectEditWorker({ prospect, onSubmit, onCancel }: ProspectEditWorkerProps) {
  const { data: workers = [], isLoading: workersLoading } = useWorkers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    prospect.products?.[0]?.id || ''
  );

  console.log('prospect in ProspectEditWorker:', prospect);

  const form = useForm<EditWorkerFormData>({
    resolver: zodResolver(editWorkerSchema),
    defaultValues: {
      worker_id: prospect.worker_id || '',
      observation: '',
      product_id: selectedProductId,
    },
  });

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue('product_id', productId);
  };

  const handleSubmit = async (data: EditWorkerFormData) => {
    setIsSubmitting(true);
    try {
      const product = prospect.products?.find((p) => p.id === data.product_id);
      if (!product) return;

      const entityType = mapProductTypeToEntityType(product.type);

      onSubmit({
        worker_id: data.worker_id,
        observation: data.observation || '',
        id: product.id,
        main_product_id: prospect.id,
        entity_type: entityType,
        type: product.type,
        insurance_type: product.insurance_type || null,
        product_id: product.id,
        status_code: product.status_code,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const workerOptions = workers.map((worker: any) => ({
    label: worker.name,
    value: worker.id,
  }));

  const productOptions = (prospect.products || []).map((product: ProspectProducts) => ({
    label: `${product.type}${product.insurance_type ? ` - ${product.insurance_type}` : ''}`,
    value: product.id,
  }));

  const currentWorker = workers.find((w: Worker) => w.id === prospect.worker_id);

  return (
    <div className="w-full">
      <header className="mb-4">
        {currentWorker && (
          <p className="text-sm text-gray-600 mt-1">
            Personal actual: <span className="font-medium">{currentWorker.name}</span>
          </p>
        )}
        {!currentWorker && prospect.worker_id && (
          <p className="text-sm text-gray-500 mt-1">Sin personal asignado</p>
        )}
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {productOptions.length > 1 && (
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  <FormControl>
                    <SelectOptions
                      options={productOptions}
                      value={field.value || ''}
                      onChange={(value) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        field.onChange(stringValue);
                        handleProductChange(stringValue || '');
                      }}
                      placeholder="Seleccionar un producto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="worker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worker</FormLabel>
                <FormControl>
                  <SelectOptions
                    options={workerOptions}
                    value={field.value || ''}
                    onChange={(value) => {
                      const stringValue = Array.isArray(value) ? value[0] : value;
                      field.onChange(stringValue || '');
                    }}
                    placeholder="Seleccionar un worker"
                    disabled={workersLoading}
                  />
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
                <FormLabel>Observación</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escribe una observación (opcional)"
                    {...field}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting || workersLoading} className="flex-1">
              {isSubmitting ? 'Guardando...' : 'Actualizar Personal'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
