import { ProspectPageClient } from "./prospectsPage";

export const metadata = {
  title: 'Prospectos - JLH',
  description: 'Gestiona tus prospectos de manera efectiva en el panel.',
};

export default function ProspectsPage() {
  return (
    <div>
      <ProspectPageClient />
    </div>
  );
}