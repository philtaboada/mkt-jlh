import { MessageCircle, Clock, CheckCheck, AlertCircle } from 'lucide-react';

// Iconos por tipo de canal
export const channelTypeIcons: Record<string, { icon: string; bgColor: string }> = {
  whatsapp: { icon: '📱', bgColor: 'bg-emerald-500' },
  facebook: { icon: '👥', bgColor: 'bg-blue-500' },
  instagram: { icon: '📷', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  website: { icon: '🌐', bgColor: 'bg-sky-500' },
  web: { icon: '🌐', bgColor: 'bg-gray-500' },
  email: { icon: '✉️', bgColor: 'bg-amber-500' },
};

export const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  open: { label: 'Abierto', color: 'bg-emerald-500', icon: MessageCircle },
  pending: { label: 'Pendiente', color: 'bg-amber-500', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-muted-foreground', icon: CheckCheck },
  snoozed: { label: 'Pospuesto', color: 'bg-blue-500', icon: AlertCircle },
};
