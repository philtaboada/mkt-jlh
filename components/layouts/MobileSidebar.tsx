'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { navItems } from '@/config/navigation';
import { NavItem } from './NavItem';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-72">
        <div className="py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">Mi App</h2>
          </div>

          <ScrollArea className="h-[calc(100vh-5rem)] px-3">
            <div className="space-y-1">
              {navItems.map((item, idx) => (
                <NavItem key={idx} item={item} collapsed={false} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
