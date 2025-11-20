import { CompaniesPageClient } from '../../../features/companies/components/CompaniesPage';

export const metadata = {
  title: 'Empresas - Dashboard',
  description: 'Maneja tus empresas desde el panel de control.',
};

export default function CompaniesPage() {
  return (
    <div className='p-4'>
      <CompaniesPageClient />
    </div>
  );
}
