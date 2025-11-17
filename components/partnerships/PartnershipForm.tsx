'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { partnershipSchema, PartnershipInput } from '@/lib/schemas/partnershipSchema';
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
import { useCompanies, useCreateCompany, useSearchCompanies } from '@/lib/hooks/useCompanies';
import { Partnerships, PartnershipBusiness } from '@/types/database';
import { SaveAll, X, Loader2 } from 'lucide-react';
import { CompanyForm } from '../companies/CompanyForm';
import { EntityDialog } from '../shared/dialogs/EntityDialog';
import { toast } from 'sonner';
import { useDocumentSearch } from '@/lib/hooks/useDocumentSearch';
import { isValidRuc } from '@/lib/utils/validation';

type PartnershipFormValues = PartnershipInput;

interface PartnershipFormProps {
  defaultValues?: Partnerships;
  onSubmit: (data: PartnershipFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

// Transform API data to form data
const transformToFormValues = (apiData?: Partnerships): PartnershipFormValues | undefined => {
  if (!apiData) return undefined;

  return {
    document: apiData.document,
    name: apiData.name,
    mobile_number: apiData.mobile_number || undefined,
    email: apiData.email || undefined,
    is_marketing: true,
    business_principal_id: apiData.business_principal_id || null,
    economic_activity: apiData.economic_activity || undefined,
    address: apiData.address || undefined,
    partnership_businesses: apiData.partnership_businesses?.map((pb) => ({
      business_id: pb.business_id,
      participation_percent: Number(pb.participation_percent),
    })),
  };
};

export function PartnershipForm({ defaultValues, onSubmit, onCancel }: PartnershipFormProps) {
  const form = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipSchema) as any,
    defaultValues: transformToFormValues(defaultValues),
  });

  const { control, handleSubmit, setError, clearErrors, formState } = form;

  const [companySearch, setCompanySearch] = React.useState('');
  const [debouncedTerm, setDebouncedTerm] = React.useState('');
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = React.useState(false);
  const [searchTrigger, setSearchTrigger] = React.useState(0);
  const lastProcessedTrigger = React.useRef(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(companySearch), 400);
    return () => clearTimeout(timeout);
  }, [companySearch]);

  const companiesQuery = useCompanies({ pageIndex: 0, pageSize: 10 });

  const { data: searchResults = [], isFetching: isSearchingCompanies } = useSearchCompanies(
    debouncedTerm,
    !defaultValues && !!debouncedTerm
  );

  const createCompanyMutation = useCreateCompany();

  const document = form.watch('document');

  const {
    data: searchResult,
    isLoading: isSearchLoading,
    error: searchError,
  } = useDocumentSearch(document, 'RUC', searchTrigger > 0, searchTrigger, 'partnership');

  type CompanyRecord = {
    id: string;
    legal_name: string;
    document: string;
  };
  const companies = (companiesQuery.data as unknown as { data?: CompanyRecord[] })?.data ?? [];

  const [recentlyCreatedCompanies, setRecentlyCreatedCompanies] = React.useState<CompanyRecord[]>(
    []
  );

  const allCompanies = React.useMemo(() => {
    const companiesMap = new Map<string, CompanyRecord>();

    companies.forEach((company) => {
      companiesMap.set(company.id, company);
    });

    recentlyCreatedCompanies.forEach((company) => {
      companiesMap.set(company.id, company);
    });

    if (searchResults.length > 0) {
      searchResults.forEach((company: CompanyRecord) => {
        companiesMap.set(company.id, company);
      });
    }

    if (defaultValues?.partnership_businesses) {
      (defaultValues.partnership_businesses as PartnershipBusiness[]).forEach(
        (pb: PartnershipBusiness) => {
          if (pb.businesses && !companiesMap.has(pb.businesses.id)) {
            companiesMap.set(pb.businesses.id, {
              id: pb.businesses.id,
              legal_name: pb.businesses.legal_name,
              document: pb.businesses.document || '',
            });
          }
        }
      );
    }

    return Array.from(companiesMap.values());
  }, [companies, searchResults, defaultValues, recentlyCreatedCompanies]);

  React.useEffect(() => {
    if (searchResult && searchTrigger > 0 && searchTrigger > lastProcessedTrigger.current) {
      if (searchResult.existsInDb) {
        toast.error('El documento ya está registrado en el sistema.');
        setSearchTrigger(0);
        return;
      }

      if (searchResult.data) {
        form.setValue('name', searchResult.data.legal_name || '');
        if (searchResult.data.address) {
          form.setValue('address', searchResult.data.address.address_detail || '');
        }
        toast.success('Datos autocompletados desde SUNAT');
      }
      lastProcessedTrigger.current = searchTrigger;
      setSearchTrigger(0);
    }
  }, [searchResult, form, searchTrigger]);

  React.useEffect(() => {
    if (searchError && searchTrigger > 0 && searchTrigger > lastProcessedTrigger.current) {
      toast.error('Error al consultar SUNAT');
      lastProcessedTrigger.current = searchTrigger;
      setSearchTrigger(0);
    }
  }, [searchError, searchTrigger]);

  const handleDocumentSearch = async (document: string) => {
    if (!document) return;

    if (!isValidRuc(document)) return;

    form.setValue('name', '');
    form.setValue('address', '');

    setSearchTrigger((prev) => prev + 1);
  };

  const { fields, append, remove } = useFieldArray<PartnershipFormValues, 'partnership_businesses'>(
    {
      control,
      name: 'partnership_businesses',
    }
  );

  const principalOptions = React.useMemo(() => {
    const currentValues = form.watch('partnership_businesses') || [];
    const businessIds = currentValues.map((pb: any) => pb.business_id).filter(Boolean) as string[];
    return allCompanies.filter((c) => businessIds.includes(c.id));
  }, [form.watch('partnership_businesses'), allCompanies]);

  const submit = async (values: PartnershipFormValues) => {
    clearErrors('partnership_businesses');

    const sum = (values.partnership_businesses ?? []).reduce(
      (acc, it) => acc + (Number(it.participation_percent) || 0),
      0
    );

    if (sum > 100) {
      setError(
        'partnership_businesses' as any,
        {
          type: 'manual',
          message: 'La suma de porcentajes no puede superar 100%',
        } as any
      );
      return;
    }

    const normalized = {
      ...values,
      business_principal_id: values.business_principal_id ?? null,
    } as PartnershipFormValues;

    await onSubmit(normalized);
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento *</FormLabel>
                <FormControl>
                  <div className="relative flex">
                    <Input
                      placeholder="12345678901"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDocumentSearch(e.currentTarget.value);
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

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="persona@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="economic_activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actividad económica</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Actividad económica"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dirección completa"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Empresas consorciadas</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setCreateCompanyDialogOpen(true)}
              >
                Crear empresa
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => append({ business_id: '', participation_percent: 0 })}
              >
                Añadir
              </Button>
            </div>
          </div>

          {formState.errors.partnership_businesses?.message && (
            <div className="text-sm text-red-600 mb-2">
              {String(formState.errors.partnership_businesses.message)}
            </div>
          )}

          <div className="space-y-2">
            {fields.map((f, idx) => (
              <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
                  <FormField
                    control={form.control}
                    name={`partnership_businesses.${idx}.business_id` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl className="grid grid-cols-1">
                          <SelectOptions
                            items={allCompanies || []}
                            valueKey="id"
                            labelKey="legal_name"
                            subtitleKey="document"
                            value={field.value ?? null}
                            onChange={(v) => {
                              field.onChange(v);
                            }}
                            placeholder="Selecciona negocio"
                            searchable={true}
                            createOption={{
                              label: 'Crear empresa',
                              onCreate: () => setCreateCompanyDialogOpen(true),
                            }}
                            loading={isSearchingCompanies}
                            onSearch={setCompanySearch}
                            className="col-span-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name={`partnership_businesses.${idx}.participation_percent` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" {...field} placeholder="% participación" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => remove(idx)}
                    aria-label="Eliminar empresa consorciada"
                    className="h-8 w-8 p-0 rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(form.watch('partnership_businesses') || []).filter((pb: any) => pb.business_id).length ===
          0 && (
          <div className="col-span-2 text-sm text-muted-foreground">
            Agrega al menos un negocio asociado para poder seleccionar la empresa principal.
          </div>
        )}

        <FormField
          control={form.control}
          name="business_principal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa principal</FormLabel>
              <FormControl>
                <SelectOptions
                  items={principalOptions || []}
                  valueKey="id"
                  labelKey="legal_name"
                  subtitleKey="document"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                  placeholder="Selecciona empresa"
                  searchable={true}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className=" h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button
            type="button"
            disabled={formState.isSubmitting || isSearchLoading}
            onClick={handleSubmit(submit)}
          >
            <SaveAll className=" h-4 w-4" />
            {formState.isSubmitting ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>

      {/* Modal para crear Empresa */}
      <EntityDialog
        title="Crear Nueva Empresa"
        description="Complete los datos de la nueva empresa que será agregada automáticamente al consorcio"
        content={(onClose) => (
          <CompanyForm
            defaultValues={{
              document: form.getValues('document'),
              document_type: 'RUC',
            }}
            onSubmit={async (data) => {
              try {
                const result = await createCompanyMutation.mutateAsync(data);
                if (result?.data?.id) {
                  const newCompany: CompanyRecord = {
                    id: result.data.id,
                    legal_name: result.data.legal_name,
                    document: result.data.document || '',
                  };
                  setRecentlyCreatedCompanies((prev) => [...prev, newCompany]);

                  const currentValues = form.getValues('partnership_businesses') || [];
                  const emptyIndex = currentValues.findIndex((item) => !item.business_id);

                  if (emptyIndex >= 0) {
                    form.setValue(
                      `partnership_businesses.${emptyIndex}.business_id`,
                      result.data.id
                    );
                  } else {
                    append({ business_id: result.data.id, participation_percent: 0 });
                  }
                }
                onClose();
              } catch (error: any) {
                toast.error(
                  error?.message ||
                    'Ocurrió un error al crear la empresa. Por favor, inténtelo de nuevo.'
                );
              }
            }}
            onCancel={onClose}
          />
        )}
        open={createCompanyDialogOpen}
        onOpenChange={setCreateCompanyDialogOpen}
        maxWidth="4xl"
      />
    </Form>
  );
}
