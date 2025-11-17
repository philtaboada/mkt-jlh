import { LeadsPageClient } from './LeadsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads - JLH',
  description: 'Maneja tus leads de manera efectiva en el panel.',
};

export default function LeadsPage() {
  return <LeadsPageClient />;
}
