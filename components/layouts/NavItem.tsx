'use client';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { NavItem as NavItemType } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
  level?: number;
}

export function NavItem({ item, collapsed, level = 0 }: NavItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = !!(item.children && item.children.length > 0);
  const isActive = !!item.href && pathname.startsWith(item.href);
  const isExact = !!item.href && pathname === item.href;
  const Icon = item.icon;

  useEffect(() => {
    if (!hasChildren) return;
    const checkChildren = (items: NavItemType[]): boolean => {
      return items.some((i) => {
        if (i.href && pathname === i.href) return true;
        if (i.children) return checkChildren(i.children);
        return false;
      });
    };

    if (checkChildren(item.children!)) setIsOpen(true);
  }, [pathname, hasChildren, item.children]);

  const paddingLeft = 14 + level * 16;

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-full justify-center rounded-lg h-12 transition-all duration-200',
                isActive && 'bg-primary text-primary-foreground shadow-lg',
                !isActive && 'hover:bg-accent/50'
              )}
              asChild={!!item.href && !hasChildren}
            >
              {item.href && !hasChildren ? (
                <Link href={item.href}>
                  <Icon className={cn('h-5 w-5', 'text-foreground')} />
                </Link>
              ) : (
                <div>
                  <Icon className={cn('h-5 w-5', isActive && 'text-primary-foreground')} />
                </div>
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent
            side="right"
            className="max-w-[280px] px-4 py-3 bg-popover border rounded-lg shadow-2xl"
            sideOffset={8}
          >
            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground">{item.name}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // --- HOJA (SIN HIJOS) ---
  if (!hasChildren && item.href) {
    return (
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start h-auto rounded-lg transition-all duration-200',
          'group relative overflow-hidden',
          isActive && 'bg-primary text-primary-foreground shadow-md',
          'bg-white'
        )}
        style={{ paddingLeft, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
        asChild
      >
        <Link href={item.href} className="flex items-center gap-3 w-full">
          <div
            className={cn(
              'flex p-1.5 rounded-md transition-colors',
              isActive ? 'bg-primary-foreground/10' : 'bg-transparent',
              'bg-white'
            )}
          >
            <Icon className={cn('h-5 w-5', 'text-foreground')} />
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className={cn('font-medium text-[14px] leading-tight', 'text-foreground')}>
              {item.name}
            </span>
            {item.description && (
              <span
                className={cn(
                  'text-[11px] leading-tight mt-0.5 line-clamp-2',
                  'text-muted-foreground'
                )}
              >
                {item.description}
              </span>
            )}
          </div>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
          )}
        </Link>
      </Button>
    );
  }

  // --- PADRE CON HIJOS ---
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-auto rounded-lg transition-all duration-200',
            'group relative overflow-hidden',
            isActive && 'bg-primary text-primary-foreground shadow-md',
            'bg-white'
          )}
          style={{ paddingLeft, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
        >
          <div
            className={cn(
              'flex p-1.5 rounded-md transition-colors',
              isActive ? 'bg-primary-foreground/10' : 'bg-transparent',
              'bg-white'
            )}
          >
            <Icon className={cn('h-5 w-5', 'text-foreground')} />
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0 mx-3">
            <span className={cn('font-medium text-[14px] leading-tight', 'text-foreground')}>
              {item.name}
            </span>
            {item.description && (
              <span
                className={cn(
                  'text-[11px] leading-tight mt-0.5 line-clamp-2',
                  'text-muted-foreground'
                )}
              >
                {item.description}
              </span>
            )}
          </div>
          <div
            className={cn(
              'flex p-1 rounded transition-transform duration-200',
              isOpen && 'rotate-0',
              !isOpen && 'rotate-0'
            )}
          >
            {isOpen ? (
              <ChevronDown className={cn('h-4 w-4', 'text-muted-foreground')} />
            ) : (
              <ChevronRight className={cn('h-4 w-4', 'text-muted-foreground')} />
            )}
          </div>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pt-1.5 pb-1">
        <div className="ml-4 pl-3 border-l-2 border-primary/20 ring-1 ring-primary/10 space-y-1 bg-white rounded-md">
          {item.children?.map((child, i) => (
            <NavItem key={i} item={child} collapsed={collapsed} level={level + 1} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
