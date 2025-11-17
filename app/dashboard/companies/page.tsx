import { CompaniesPageClient } from './CompaniesPage';

export const metadata = {
  title: 'Empresas - Dashboard',
  description: 'Maneja tus empresas desde el panel de control.',
};

export default function CompaniesPage() {
  return (
    <div>
      <CompaniesPageClient />
    </div>
  );
}
