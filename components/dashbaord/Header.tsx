'use client';

import * as React from 'react';
import { Search, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, isLoading, logout, isLogoutLoading } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const displayName =
    (user as any)?.user_metadata?.name || (user as any)?.user_metadata?.full_name || user?.email;
  const displayEmail = user?.email;
  const [showSearch, setShowSearch] = React.useState(false);

  function toggleSidebar() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggleSidebar'));
    }
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-background text-foreground backdrop-blur-sm border-b border-border flex items-center px-4">
      <div className="flex items-center gap-3 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>

      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <input
            placeholder="Buscar..."
            className="w-full border rounded-md px-3 py-2 bg-transparent border-slate-200 dark:border-slate-800"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch((s) => !s)}
            aria-label="Buscar"
          >
            <Search className="size-4" />
          </Button>
        </div>

        {showSearch && (
          <div className="absolute left-4 top-16 right-4 bg-white dark:bg-slate-900 p-3 rounded-md shadow md:hidden">
            <input
              autoFocus
              placeholder="Buscar..."
              className="w-full border rounded-md px-3 py-2 bg-transparent border-slate-200 dark:border-slate-800"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme switch - solo renderizar cuando esté montado */}
        {mounted && (
          <div className="flex items-center gap-2 px-1">
            <Sun className="size-4 text-slate-500 dark:text-slate-300" />
            <Switch aria-label="Toggle theme" checked={isDark} onCheckedChange={toggleTheme} />
            <Moon className="size-4 text-slate-500 dark:text-slate-300" />
          </div>
        )}

        <Button variant="ghost" size="icon">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-1">
              <Avatar>
                <AvatarImage src="/avatar.png" alt={displayName ?? 'User'} />
                <AvatarFallback>{displayName ? String(displayName)[0] : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/avatar.png" alt={displayName ?? 'User'} />
                </Avatar>
                <div>
                  <div className="text-sm font-medium">
                    {isLoading ? 'Cargando...' : displayName || 'Usuario'}
                  </div>
                  <div className="text-xs text-slate-500">{displayEmail || '—'}</div>
                </div>
              </div>
            </div>
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem>
              <User className="size-4 mr-2" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="size-4 mr-2" /> Configuración
            </DropdownMenuItem>
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem
              onSelect={() => {
                logout?.();
              }}
            >
              <LogOut className="size-4 mr-2" />
              {isLogoutLoading ? 'Cerrando...' : 'Cerrar sesión'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
