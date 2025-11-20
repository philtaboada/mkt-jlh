import { IntegrationList } from '@/features/chat/components/IntegrationList';
import { PanelLeft } from 'lucide-react';

const integrations = [
  {
    name: 'WhatsApp',
    description: 'Conecta tu número de WhatsApp Business',
    status: 'disconnected',
    href: '/dashboard/chat/settings/integrations/whatsapp',
  },
  {
    name: 'Facebook Messenger',
    description: 'Atiende mensajes desde tu página de Facebook',
    status: 'connected',
    href: '/dashboard/chat/settings/integrations/facebook',
  },
  {
    name: 'Instagram DM',
    description: 'Conecta tu cuenta de Instagram Business',
    status: 'disconnected',
    href: '/dashboard/chat/settings/integrations/instagram',
  },
  {
    name: 'Email SMTP',
    description: 'Configura bandejas de entrada por correo',
    status: 'disconnected',
    href: '/dashboard/chat/settings/integrations/email',
  },
] as const;

export default function IntegrationsPage() {
  return (
    <div className="p-4 bg-white dark:bg-background rounded-xl shadow-md  h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20">
          <PanelLeft size={24} className="text-primary" />
        </span>
        <h1 className="text-2xl font-bold text-primary dark:text-primary">Integraciones</h1>
      </div>
      <p className="mb-6 text-muted-foreground text-base dark:text-muted-foreground">
        Administra y conecta tus canales externos en un solo panel. Visualiza el estado de cada
        integración y configura fácilmente WhatsApp, Facebook Messenger, Instagram DM y Email SMTP
        según las necesidades de tu empresa.
      </p>
      <IntegrationList integrations={integrations} />
    </div>
  );
}
