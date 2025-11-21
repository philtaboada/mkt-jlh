import { PartnershipsPageClient } from "@/features/partnerships/components/PartnershipsPage";

export const metadata = {
  title: 'Consorcios - Dashboard',
  description: 'Administra tus consorcios desde el panel de control.',
};

export default function PartnershipsPage() {
  return (
    <div className='p-4'>
      <PartnershipsPageClient />
    </div>
  );
}
