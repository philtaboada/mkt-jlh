'use client';

import { Control, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SelectOptions } from '@/components/shared/select-options';
import { InsuranceTypeProcess, TypeOfCoverageRecord } from '@/lib/constants/insuranceTypeConstans';
import { TypeInsurance } from '@/lib/enums/insuranceTypeEnums';

interface InsuranceFieldsSectionProps {
  control: Control<any>;
  fields: any[];
}

export function InsuranceFieldsSection({ control, fields }: InsuranceFieldsSectionProps) {
  const insuranceTypes = useWatch({
    control,
    name: 'insurances',
  });

  return (
    <>
      {fields.map((field, index) => {
        // Obtener el tipo de seguro del array observado
        const insuranceType = insuranceTypes?.[index]?.insurance_type;
        return (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h4 className="text-lg font-semibold text-blue-900">Campos para {insuranceType}</h4>

            {/* Campos comunes para todos los tipos */}
            <FormField
              control={control}
              name={`insurances.${index}.process_type`}
              rules={{ required: true }}
              render={({ field: processField }) => (
                <FormItem>
                  <FormLabel>Tipo de Proceso</FormLabel>
                  <FormControl>
                    <SelectOptions
                      placeholder="Selecciona el tipo de proceso"
                      items={InsuranceTypeProcess}
                      value={processField.value}
                      onChange={(value) => processField.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos específicos para SOAT */}
            {insuranceType === TypeInsurance.SOAT && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`insurances.${index}.license_plate_number`}
                    rules={{ required: true }}
                    render={({ field: plateField }) => (
                      <FormItem>
                        <FormLabel>Número de Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-123" {...plateField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`insurances.${index}.type_of_use`}
                    rules={{ required: true }}
                    render={({ field: useField }) => (
                      <FormItem>
                        <FormLabel>Tipo de Uso</FormLabel>
                        <FormControl>
                          <SelectOptions
                            placeholder="Selecciona el tipo de uso"
                            options={[
                              { value: 'particular', label: 'Particular' },
                              { value: 'publico', label: 'Público' },
                              { value: 'comercial', label: 'Comercial' },
                            ]}
                            value={useField.value}
                            onChange={(value) => useField.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`insurances.${index}.year_of_manufacture`}
                  rules={{ required: true }}
                  render={({ field: yearField }) => (
                    <FormItem>
                      <FormLabel>Año de Fabricación</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2023" {...yearField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Campos específicos para VEHICULAR */}
            {insuranceType === TypeInsurance.VEHICULAR && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`insurances.${index}.insured_amount`}
                    rules={{ required: true }}
                    render={({ field: amountField }) => (
                      <FormItem>
                        <FormLabel>Monto Asegurado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            {...amountField}
                            onChange={(e) => amountField.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`insurances.${index}.type_of_use`}
                    rules={{ required: true }}
                    render={({ field: useField }) => (
                      <FormItem>
                        <FormLabel>Tipo de Uso</FormLabel>
                        <FormControl>
                          <SelectOptions
                            placeholder="Selecciona el tipo de uso"
                            options={[
                              { value: 'particular', label: 'Particular' },
                              { value: 'comercial', label: 'Comercial' },
                            ]}
                            value={useField.value}
                            onChange={(value) => useField.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`insurances.${index}.license_plate_number`}
                  render={({ field: plateField }) => (
                    <FormItem>
                      <FormLabel>Número de Placa (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-123" {...plateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Campos específicos para SCTR */}
            {insuranceType === TypeInsurance.SCTR && (
              <FormField
                control={control}
                name={`insurances.${index}.coverage_of_type`}
                rules={{ required: true }}
                render={({ field: coverageField }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cobertura</FormLabel>
                    <FormControl>
                      <SelectOptions
                        placeholder="Selecciona el tipo de cobertura"
                        items={Object.entries(TypeOfCoverageRecord).map(([value, label]) => ({
                          value,
                          label,
                        }))}
                        value={coverageField.value}
                        onChange={(value) => coverageField.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
