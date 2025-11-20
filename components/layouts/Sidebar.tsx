'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navItems } from '@/features/config/navigation';
import { cn } from '@/lib/utils';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { NavItem } from './NavItem';

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ className, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <div className={cn('pb-12 border-r bg-background', className)}>
      <div className="space-y-4 py-4">
        {/* Header con toggle */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            {!collapsed && <h2 className="px-4 text-xl font-semibold tracking-tight">Mi App</h2>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange(!collapsed)}
              className={cn(collapsed && 'w-full')}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navegación */}
        <ScrollArea className="h-[calc(100vh-8rem)] px-3">
          <div className="space-y-1">
            {navItems.map((item, idx) => (
              <NavItem key={idx} item={item} collapsed={collapsed} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
