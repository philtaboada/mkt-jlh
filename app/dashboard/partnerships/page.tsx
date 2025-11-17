import { PartnershipsPageClient } from './PartnershipsPage';

export const metadata = {
  title: 'Consorcios - Dashboard',
  description: 'Administra tus consorcios desde el panel de control.',
};

export default function PartnershipsPage() {
  return (
    <div>
      <PartnershipsPageClient />
    </div>
  );
}
