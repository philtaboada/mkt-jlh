'use client';

import Link from 'next/link';
import {
  Settings,
  Users,
  Key,
  MessageSquare,
  BarChart3,
  UserCircle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const settingsMenu = [
  {
    title: 'Canales',
    description: 'Gestiona WhatsApp, Website widget y otros canales',
    href: '/chat/settings/integrations',
    icon: MessageSquare,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Equipos',
    description: 'Organiza tus agentes en equipos de trabajo',
    href: '/chat/settings/teams',
    icon: UserCircle,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'API Keys',
    description: 'Administra las claves de acceso a la API',
    href: '/chat/settings/api-keys',
    icon: Key,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Cuotas y límites',
    description: 'Revisa el uso y límites de tu plan',
    href: '/chat/settings/quotas',
    icon: BarChart3,
    color: 'bg-destructive/10 text-destructive',
  },
];

export function SettingsView() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground">Administra la configuración de tu inbox</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4 md:grid-cols-2">
            {settingsMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            item.color
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-base mb-1 text-foreground">{item.title}</CardTitle>
                      <CardDescription className="text-sm">{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
