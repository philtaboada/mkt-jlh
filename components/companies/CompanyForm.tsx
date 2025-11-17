'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { CompanyInput, companySchema } from '@/lib/schemas/companySchema';
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
import { SelectOptions } from '@/components/shared/select-options';
import { useWorkers } from '@/lib/hooks/useWorkers';
import { SaveAll, X, Search, Loader2 } from 'lucide-react';
import { isValidRuc, isValidDni } from '@/lib/utils/validation';
import { useDocumentSearch } from '@/lib/hooks/useDocumentSearch';
import { toast } from 'sonner';

type CompanyFormValues = CompanyInput;

interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>;
  onSubmit: (data: CompanyFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function CompanyForm({ defaultValues, onSubmit, onCancel }: CompanyFormProps) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as any,
    defaultValues: defaultValues || {
      document_type: 'RUC',
      document: '',
      legal_name: '',
      classification_business: '',
      worker_id: '',
      mobile_number: '',
      email: '',
      address: {
        address_detail: '',
        district: '',
        province: '',
        department: '',
        country: '',
      },
      is_markeing: true,
    },
  });

  const { handleSubmit, formState } = form;
  const [searchTrigger, setSearchTrigger] = React.useState(0);

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        document_type: (defaultValues.document_type as any) ?? 'RUC',
        document: defaultValues.document ?? '',
        legal_name: defaultValues.legal_name ?? '',
        classification_business: defaultValues.classification_business ?? '',
        worker_id: defaultValues.worker_id ?? '',
        mobile_number: defaultValues.mobile_number ?? '',
        email: defaultValues.email ?? '',
        address: {
          address_detail: defaultValues.address?.address_detail ?? '',
          district: defaultValues.address?.district ?? '',
          province: defaultValues.address?.province ?? '',
          department: defaultValues.address?.department ?? '',
          country: defaultValues.address?.country ?? '',
        },
        is_markeing: defaultValues.is_markeing ?? true,
      });
    } else {
      form.reset();
    }
  }, [defaultValues, form]);

  const { data: workers, isLoading: isWorkersLoading } = useWorkers();

  const document = form.watch('document');
  const documentType = form.watch('document_type');

  const {
    data: searchResult,
    isLoading: isSearchLoading,
    error: searchError,
  } = useDocumentSearch(document, documentType, searchTrigger > 0, searchTrigger, 'company');

  React.useEffect(() => {
    if (searchResult && searchTrigger > 0) {
      if (searchResult.existsInDb) {
        toast.error('El documento ya está registrado en el sistema.');
        setSearchTrigger(0);
        return;
      }

      if (searchResult.data) {
        form.setValue('legal_name', searchResult.data.legal_name || '');
        if (searchResult.data.address) {
          form.setValue('address', {
            ...form.getValues('address'),
            ...searchResult.data.address,
          });
        }
        toast.success('Datos autocompletados desde SUNAT');
      }
      setSearchTrigger(0);
    }
  }, [searchResult, form, searchTrigger]);

  React.useEffect(() => {
    if (searchError && searchTrigger > 0) {
      toast.error('Error al consultar SUNAT');
      setSearchTrigger(0);
    }
  }, [searchError, searchTrigger]);

  const handleDocumentSearch = async (document: string, documentType: string) => {
    if (!document || !documentType) return;

    const isValidRucCheck = documentType === 'RUC' && isValidRuc(document);
    const isValidDniCheck = documentType === 'DNI' && isValidDni(document);

    if (!isValidRucCheck && !isValidDniCheck) return;

    // Clear previous autocompleted data
    form.setValue('legal_name', '');
    form.setValue('address', {
      address_detail: '',
      district: '',
      province: '',
      department: '',
      country: '',
    });

    setSearchTrigger((prev) => prev + 1);
  };

  const submit = async (values: CompanyFormValues) => {
    const normalized: any = {
      ...values,
      worker_id: (values as any).worker_id ?? null,
    };
    await onSubmit(normalized as unknown as CompanyFormValues);
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="document_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento *</FormLabel>
                <FormControl>
                  <SelectOptions
                    items={[
                      { id: 'DNI', name: 'DNI' },
                      { id: 'RUC', name: 'RUC' },
                      { id: 'CE', name: 'CE' },
                    ]}
                    valueKey="id"
                    labelKey="name"
                    value={field.value ?? 'DNI'}
                    onChange={(v) => field.onChange(v)}
                    placeholder="Selecciona tipo"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Documento *</FormLabel>
                </div>
                <FormControl>
                  <div className="relative flex">
                    <Input
                      placeholder="12345678"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const docType = form.getValues('document_type');
                          if (docType === 'RUC' || docType === 'DNI') {
                            handleDocumentSearch(e.currentTarget.value, docType);
                          }
                        }
                      }}
                    />
                    {isSearchLoading && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin z-10" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="legal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razón Social/Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Empresa S.A.C." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="classification_business"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clasificación de Negocio</FormLabel>
              <FormControl>
                <SelectOptions
                  options={[
                    { value: 'General', label: 'General' },
                    { value: 'Gold', label: 'Gold' },
                    { value: 'Premium', label: 'Premium' },
                  ]}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                  placeholder="Clasificación"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="worker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal</FormLabel>
                <FormControl>
                  <SelectOptions
                    items={workers ?? []}
                    searchable
                    valueKey="id"
                    labelKey="name"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v)}
                    placeholder="Selecciona encargado"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+51 9 1234 5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="empresa@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Dirección</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.address_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalle</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distrito</FormLabel>
                  <FormControl>
                    <Input placeholder="Distrito" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address.province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input placeholder="Provincia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Departamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="País" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button
            type="button"
            disabled={formState.isSubmitting || isSearchLoading}
            onClick={handleSubmit(submit)}
          >
            <SaveAll className="h-4 w-4" />
            {formState.isSubmitting ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
