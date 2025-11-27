'use client';

import { useEffect, useState } from 'react';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Guardar estado de colapso en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleCollapsedChange = (value: boolean) => {
    setCollapsed(value);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(value));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 hidden h-screen border-r bg-background transition-all duration-300 lg:block',
          collapsed ? 'w-16' : 'w-72'
        )}
      >
        <Sidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} />
      </aside>

      {/* Sidebar Mobile */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-16' : 'lg:pl-72')}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
