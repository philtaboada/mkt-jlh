'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Building2,
  Activity,
  Mail,
  MessageSquare,
  BarChart3,
  Calendar,
  Settings,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Leads',
    href: '/dashboard/leads',
    icon: Users,
    children: [
      { name: 'Leads', href: '/dashboard/leads', icon: Users },
      { name: 'Prospectos', href: '/dashboard/prospects', icon: Users },
    ],
  },
  {
    name: 'Empresas',
    href: '/dashboard/companies',
    icon: Building2,
    children: [
      { name: 'Empresas', href: '/dashboard/companies', icon: Building2 },
      { name: 'Consorcios', href: '/dashboard/partnerships', icon: Users },
    ],
  },
  { name: 'Actividades', href: '/dashboard/activities', icon: Activity },
  { name: 'Campañas Email', href: '/dashboard/campaigns', icon: Mail },
  { name: 'Resend', href: '/dashboard/settings/resend', icon: Mail },
  { name: 'Chat', href: '/dashboard/whatsapp', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
}: {
  collapsed?: boolean;
  setCollapsed?: (v: boolean | ((v: boolean) => boolean)) => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [collapsedState, setCollapsedState] = React.useState(false);
  const collapsed = typeof collapsedProp === 'boolean' ? collapsedProp : collapsedState;
  const setCollapsed = setCollapsedProp ? (v: any) => setCollapsedProp(v) : setCollapsedState;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    function onToggle() {
      setMobileOpen((v) => !v);
    }
    window.addEventListener('toggleSidebar', onToggle);
    return () => window.removeEventListener('toggleSidebar', onToggle);
  }, []);

  return (
    <>
      {/* Desktop / collapsed */}
      <aside
        className={cn(
          'bg-background text-foreground border-r border-border h-screen fixed top-0 left-0 z-20 transition-all hidden lg:block',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <Link
              href="/dashboard"
              className={cn('flex items-center gap-2', collapsed && 'justify-center')}
            >
              <div className="w-8 h-8 rounded-md bg-primary/90 flex items-center justify-center text-white font-bold">
                J
              </div>
              {!collapsed && <span className="font-semibold">JLH</span>}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((s) => !s)}
              aria-label="Toggle sidebar"
            >
              <Menu className="size-4" />
            </Button>
          </div>

          <nav className="flex-1 overflow-auto px-2 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(item.href + '/');

                if (item.children && item.children.length > 0) {
                  const parentActive =
                    item.children.some(
                      (c) => pathname === c.href || pathname?.startsWith(c.href + '/')
                    ) || active;
                  const isOpen = collapsed ? false : (openGroups[item.href] ?? parentActive);
                  return (
                    <li key={item.href}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                          parentActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-700 dark:text-slate-200'
                        )}
                        onClick={() => setOpenGroups((s) => ({ ...s, [item.href]: !isOpen }))}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          className={cn(
                            'flex items-center gap-3 flex-1',
                            collapsed && 'justify-center'
                          )}
                        >
                          <Icon className="size-4" />
                          {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown
                            className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
                          />
                        )}
                      </div>

                      {!collapsed && isOpen && (
                        <ul className="mt-1 pl-6 space-y-1">
                          {item.children.map((child) => {
                            const childActive =
                              pathname === child.href || pathname?.startsWith(child.href + '/');
                            const ChildIcon = (child as any).icon;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    'flex items-center gap-2 px-3 py-1 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                                    childActive
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-slate-600 dark:text-slate-300'
                                  )}
                                >
                                  {ChildIcon ? (
                                    <ChildIcon className="size-3" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                                  )}
                                  <span className="ml-1">{child.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700 dark:text-slate-200',
                        collapsed && 'justify-center'
                      )}
                    >
                      <Icon className="size-4" />
                      {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-3 py-4 border-t border-border">
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              <Settings className="size-4" />
              {!collapsed && <span className="text-sm">Ajustes</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background text-foreground border-r border-border">
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/90 flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <span className="font-semibold">JLH</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </div>
              <nav className="flex-1 overflow-auto px-2 py-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === '/dashboard'
                        ? pathname === item.href
                        : pathname === item.href || pathname?.startsWith(item.href + '/');

                    if (item.children && item.children.length > 0) {
                      const parentActive =
                        item.children.some(
                          (c) => pathname === c.href || pathname?.startsWith(c.href + '/')
                        ) || active;
                      const isOpenMobile = openGroups[item.href] ?? parentActive;
                      return (
                        <li key={item.href}>
                          <div
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                              parentActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-700 dark:text-slate-200'
                            )}
                            onClick={() => setOpenGroups((s) => ({ ...s, [item.href]: !isOpenMobile }))}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Icon className="size-4" />
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <ChevronDown
                              className={cn('size-4 transition-transform', isOpenMobile && 'rotate-180')}
                            />
                          </div>
                          {isOpenMobile && (
                            <ul className="mt-1 pl-4 space-y-1">
                              {item.children.map((child) => {
                                const childActive =
                                  pathname === child.href || pathname?.startsWith(child.href + '/');
                                const ChildIcon = (child as any).icon;
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={() => setMobileOpen(false)}
                                      className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                                        childActive
                                          ? 'bg-primary/10 text-primary'
                                          : 'text-slate-700 dark:text-slate-200'
                                      )}
                                    >
                                      {ChildIcon ? (
                                        <ChildIcon className="size-4" />
                                      ) : (
                                        <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                                      )}
                                      <span className="text-sm font-medium">{child.name}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    }

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                            active
                              ? 'bg-primary/10 text-primary'
                              : 'text-slate-700 dark:text-slate-200'
                          )}
                        >
                          <Icon className="size-4" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
