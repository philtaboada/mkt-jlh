import type { ReactNode } from 'react';
import DashboardShell from '@/components/dashbaord/DashboardShell';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
