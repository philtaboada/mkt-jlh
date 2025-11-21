
import { LeadsPageClient } from '@/features/leads/components/LeadsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads - JLH',
  description: 'Maneja tus leads de manera efectiva en el panel.',
};

export default function LeadsPage() {
  return <div className='p-4'>
    <LeadsPageClient />
  </div>;
}
