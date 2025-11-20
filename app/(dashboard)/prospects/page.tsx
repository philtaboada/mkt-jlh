import { ProspectPageClient } from "@/features/prospects/components/prospectsPage";

export const metadata = {
  title: 'Prospectos - JLH',
  description: 'Gestiona tus prospectos de manera efectiva en el panel.',
};

export default function ProspectsPage() {
  return (
    <div className='p-4'>
      <ProspectPageClient />
    </div>
  );
}