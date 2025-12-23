'use client';

import { Prospect } from '@/features/prospects/types/prospects';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/lib/utils/covertDate';
import { LeadEntityTypeLabels, LeadProductTypeLabels } from '@/features/leads/types/leadLabels';
import { LeadProductTypeEnum } from '@/features/leads/types/leadEnums';
import { getSeaceDataTypeLabel } from '@/lib/constants/seaceConstants';
import { getInitials, productColors } from '@/lib/utils/leadUtils';

interface ProspectViewProps {
  prospect: Prospect;
}

export function ProspectView({ prospect }: ProspectViewProps) {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Información básica */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre/Razón Social</label>
              <p className="text-sm text-gray-900">{prospect.business_or_person_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Entidad</label>
              <p className="text-sm text-gray-900">
                {prospect.type_entity
                  ? LeadEntityTypeLabels[prospect.type_entity as keyof typeof LeadEntityTypeLabels]
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Canal de Referencia</label>
              <p className="text-sm text-gray-900">{prospect.referral_channel || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Gestión</label>
              <p className="text-sm text-gray-900">
                {prospect.management_date ? formatDate(prospect.management_date) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Personal asignado */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Asignado</h3>
          {prospect.worker ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {getInitials(
                  prospect.worker.name.split(' ')[0],
                  prospect.worker.name.split(' ').slice(1).join(' ')
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{prospect.worker.name}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Sin personal asignado</p>
          )}
        </div>

        {/* Productos */}
        {prospect.products && prospect.products.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos</h3>
            <div className="space-y-3">
              {prospect.products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        className={`text-xs font-semibold text-white ${productColors[product.type] || 'bg-gray-500'}`}
                      >
                        {product.type === LeadProductTypeEnum.SEGUROS
                          ? product.insurance_type ||
                            LeadProductTypeLabels[
                              product.type as keyof typeof LeadProductTypeLabels
                            ] ||
                            product.type
                          : LeadProductTypeLabels[
                              product.type as keyof typeof LeadProductTypeLabels
                            ] || product.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getSeaceDataTypeLabel(product.status_code) || product.status_code}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-500">Última Gestión</label>
                      <p className="text-gray-900">{product.date_passed || '-'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Última Actualización</label>
                      <p className="text-gray-900">
                        {product.update_date_passed
                          ? formatDateTime(product.update_date_passed)
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">ID del Prospecto</label>
              <p className="text-gray-900 font-mono text-xs">{prospect.id}</p>
            </div>
            <div>
              <label className="font-medium text-gray-500">ID del Lead</label>
              <p className="text-gray-900 font-mono text-xs">{prospect.mkt_lead_id || '-'}</p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Fecha de Creación</label>
              <p className="text-gray-900">
                {prospect.created_at ? formatDateTime(prospect.created_at) : '-'}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Última Actualización</label>
              <p className="text-gray-900">
                {prospect.updated_at ? formatDateTime(prospect.updated_at) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
