import {
  Home,
  Users,
  Building2,
  Activity,
  MessageSquare,
  BarChart3,
  Calendar,
  Settings,
  Target,
  Handshake,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Vista general' },
  {
    name: 'Leads',
    href: '/leads',
    description: 'Gestión de leads',
    icon: Users,
    children: [
      { name: 'Leads', href: '/leads', icon: Users, description: 'Lista de leads' },
      {
        name: 'Prospectos',
        href: '/prospects',
        icon: Target,
        description: 'Lista de prospectos',
      },
    ],
  },
  {
    name: 'Empresas',
    href: '/companies',
    description: 'Gestión de empresas',
    icon: Building2,
    children: [
      {
        name: 'Empresas',
        href: '/companies',
        icon: Building2,
        description: 'Lista de empresas',
      },
      {
        name: 'Consorcios',
        href: '/partnerships',
        icon: Handshake,
        description: 'Lista de consorcios',
      },
    ],
  },
  {
    name: 'Actividades',
    href: '/activities',
    icon: Activity,
    description: 'Registro de actividades',
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'Centro de mensajes',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Estadísticas y métricas',
  },
  {
    name: 'Calendario',
    href: '/calendar',
    icon: Calendar,
    description: 'Agenda y eventos',
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    description: 'Ajustes del sistema',
  },
];
