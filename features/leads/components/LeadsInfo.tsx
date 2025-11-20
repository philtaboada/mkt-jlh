
import React from 'react'

interface LeadsInfoProps {
  data?: any;
  filters: any;
}

const LeadsInfo = ({ data, filters }: LeadsInfoProps) => {
  return (
    <div className="mb-4 text-sm text-gray-600">
      Mostrando {data?.data.length || 0} de {data?.total || 0} leads
      {filters.search && ` (filtrado por: "${filters.search}")`}
    </div>
  );
}

export default LeadsInfo
