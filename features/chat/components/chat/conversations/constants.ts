import {
  MessageCircle,
  Clock,
  CheckCheck,
  AlertCircle,
  Bot,
  User,
  MessageSquare,
  Users,
  Instagram,
  Facebook,
  Globe,
  Mail,
  Link,
} from 'lucide-react';

// Iconos por tipo de canal
export const channelTypeIcons: Record<string, { icon: React.ElementType; bgColor: string }> = {
  whatsapp: { icon: MessageSquare, bgColor: 'bg-emerald-500' },
  messenger: { icon: Facebook, bgColor: 'bg-blue-600' },
  instagram: { icon: Instagram, bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  website: { icon: Globe, bgColor: 'bg-sky-500' },
  web: { icon: Globe, bgColor: 'bg-sky-500' },
  email: { icon: Mail, bgColor: 'bg-amber-500' },
  link: { icon: Link, bgColor: 'bg-gray-500' },
};

export const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  open: { label: 'Abierto', color: 'bg-emerald-500', icon: MessageCircle },
  pending: { label: 'Pendiente', color: 'bg-amber-500', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-muted-foreground', icon: CheckCheck },
  snoozed: { label: 'Pospuesto', color: 'bg-blue-500', icon: AlertCircle },
  bot: { label: 'Bot', color: 'bg-purple-500', icon: Bot },
  agent: { label: 'Agente', color: 'bg-green-500', icon: User },
};
