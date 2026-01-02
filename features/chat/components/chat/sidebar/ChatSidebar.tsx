'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Inbox,
  AtSign,
  Bot,
  Settings,
  BarChart3,
  Clock,
  Star,
  Archive,
  Zap,
  Tag,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useConversationCounts } from '@/features/chat/hooks/useConversations';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badgeKey?: 'inbox' | 'mentions' | 'starred' | 'snoozed' | 'archived';
}

const primaryNav: NavItem[] = [
  { href: '/chat/inbox', icon: Inbox, label: 'Conversaciones', badgeKey: 'inbox' },
  { href: '/chat/mentions', icon: AtSign, label: 'Menciones', badgeKey: 'mentions' },
];

const secondaryNav: NavItem[] = [
  { href: '/chat/contacts', icon: UserCircle, label: 'Contactos' },
  { href: '/chat/tags', icon: Tag, label: 'Etiquetas' },
  /* { href: '/chat/inbox?filter=starred', icon: Star, label: 'Destacados', badgeKey: 'starred' },
  { href: '/chat/inbox?filter=snoozed', icon: Clock, label: 'Pospuestos', badgeKey: 'snoozed' },

*/
];

const toolsNav: NavItem[] = [
  { href: '/chat/automations', icon: Zap, label: 'Automatizaciones' },
  /* { href: '/analytics', icon: BarChart3, label: 'Reportes' }, */
];

const settingsNav: NavItem[] = [{ href: '/chat/settings', icon: Settings, label: 'Configuración' }];

export function ChatSidebar() {
  const pathname = usePathname();
  const { data: counts } = useConversationCounts();

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getBadgeCount = (badgeKey?: NavItem['badgeKey']) => {
    if (!badgeKey || !counts) return 0;
    return counts[badgeKey] || 0;
  };

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
      <TooltipProvider delayDuration={100}>
        {/* Logo */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            C
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex flex-col gap-1 mb-6">
          {primaryNav.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              badgeCount={getBadgeCount(item.badgeKey)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-border mb-6" />

        {/* Secondary Navigation */}
        <div className="flex flex-col gap-1 mb-6">
          {secondaryNav.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              badgeCount={getBadgeCount(item.badgeKey)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-border mb-6" />

        {/* Tools Navigation */}
        <div className="flex flex-col gap-1 flex-1">
          {toolsNav.map((item) => (
            <NavButton key={item.href} item={item} isActive={isActive(item.href)} badgeCount={0} />
          ))}
        </div>

        {/* Settings at bottom */}
        <div className="flex flex-col gap-1 mt-auto">
          {settingsNav.map((item) => (
            <NavButton key={item.href} item={item} isActive={isActive(item.href)} badgeCount={0} />
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

function NavButton({
  item,
  isActive,
  badgeCount,
}: {
  item: NavItem;
  isActive: boolean;
  badgeCount: number;
}) {
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={item.href}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-12 h-12 relative transition-all duration-200',
              isActive
                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="w-6 h-6" />
            {badgeCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 bg-destructive hover:bg-destructive text-destructive-foreground text-xs font-bold">
                {badgeCount > 99 ? '99+' : badgeCount}
              </Badge>
            )}
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
