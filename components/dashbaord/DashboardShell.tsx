'use client';

import { Sidebar } from '@/components/dashbaord/Sidebar';
import { Header } from '@/components/dashbaord/Header';
import { useState } from 'react';
import { useClientAuth } from '@/lib/hooks/useClientAuth';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { loading } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={collapsed ? 'lg:ml-20' : 'lg:ml-64'}>
        <Header />
        <main className="p-6 bg-background text-foreground min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </>
  );
}
