'use client';

import { useState } from 'react';
import { SelectOptions } from '@/components/shared/select-options';
import { Lead } from '@/features/leads/types/leads';
import { CartaFianzaForm } from './CartaFianzaForm';
import { IsosForm } from './IsosForm';
import { FideicomisosForm } from './FideicomisosForm';
import { SegurosForm } from './SegurosForm';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import { LeadProductType, LeadProductTypeEnum } from '@/features/leads/types/leadEnums';
import { LeadProductTypeOptions } from '@/features/leads/types/leadLabels';

interface SendToDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  type: 'add' | 'new';
  onSubmit: (data: any) => Promise<void>;
}

export function SendToDealsModal({ isOpen, onClose, lead, type, onSubmit }: SendToDealsModalProps) {
  const [selectedProductType, setSelectedProductType] = useState<LeadProductType | ''>('');

  const handleProductTypeSelect = (value: string | string[] | null) => {
    if (typeof value === 'string') {
      setSelectedProductType(value as LeadProductType);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      onClose();
      setSelectedProductType('');
    } catch (error) {
      console.error('Error al enviar a deals:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedProductType('');
  };

  const renderContent = (closeDialog: () => void) => {
    const availableProductTypes: LeadProductType[] = [
      LeadProductTypeEnum.CARTA_FIANZA,
      LeadProductTypeEnum.FIDEICOMISOS,
      LeadProductTypeEnum.SEGUROS,
    ];
    if (lead?.type_entity !== 'partnerships') {
      availableProductTypes.push(LeadProductTypeEnum.ISOS);
    }

    return (
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Tipo de producto</label>
          <SelectOptions
            placeholder="Selecciona un tipo de producto"
            options={LeadProductTypeOptions.filter((option) =>
              availableProductTypes.includes(option.value as LeadProductType)
            )}
            value={selectedProductType}
            onChange={handleProductTypeSelect}
          />

          <hr className="my-2 text-gray-50 dark:text-gray-800" />
        </div>

        {selectedProductType ? (
          <div>
            {(() => {
              switch (selectedProductType) {
                case LeadProductTypeEnum.CARTA_FIANZA:
                  return (
                    <CartaFianzaForm
                      defaultValues={lead}
                      type={type}
                      onSubmit={handleFormSubmit}
                      onCancel={closeDialog}
                    />
                  );
                case LeadProductTypeEnum.ISOS:
                  return (
                    <IsosForm
                      defaultValues={lead}
                      type={type}
                      onSubmit={handleFormSubmit}
                      onCancel={closeDialog}
                    />
                  );
                case LeadProductTypeEnum.FIDEICOMISOS:
                  return (
                    <FideicomisosForm
                      defaultValues={lead}
                      type={type}
                      onSubmit={handleFormSubmit}
                      onCancel={closeDialog}
                    />
                  );
                case LeadProductTypeEnum.SEGUROS:
                  return (
                    <SegurosForm
                      defaultValues={lead}
                      type={type}
                      onSubmit={handleFormSubmit}
                      onCancel={closeDialog}
                    />
                  );
                default:
                  return <div>Selecciona un tipo de producto válido</div>;
              }
            })()}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">Selecciona el tipo de producto</h3>
              <p>Elige el tipo de producto al que quieres convertir este lead</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <EntityDialog
      title="Enviar Lead a Deals"
      description="Convierte este lead en una oportunidad de negocio seleccionando el tipo de producto."
      content={renderContent}
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      maxWidth="4xl"
    />
  );
}
