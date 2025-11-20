'use client';
import { useState } from 'react';
import WhatsAppForm from '@/features/chat/components/integration/WhatsAppForm';
import FacebookForm from '@/features/chat/components/integration/FacebookForm';
import InstagramForm from '@/features/chat/components/integration/InstagramForm';
import EmailForm from '@/features/chat/components/integration/EmailForm';

interface Integration {
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  href: string;
}

interface IntegrationListProps {
  integrations: readonly Integration[];
}

export function IntegrationList({ integrations }: IntegrationListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function renderForm(name: string) {
    switch (name) {
      case 'WhatsApp':
        return <WhatsAppForm />;
      case 'Facebook Messenger':
        return <FacebookForm />;
      case 'Instagram DM':
        return <InstagramForm />;
      case 'Email SMTP':
        return <EmailForm />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration, idx) => (
        <div
          key={integration.name}
          className="border rounded-lg p-4 flex flex-col bg-white dark:bg-background border-primary/10 dark:border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary dark:text-primary">
                {integration.name}
              </h2>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {integration.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  integration.status === 'connected'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </span>
              <button
                className="text-primary hover:underline text-sm dark:text-primary"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`integration-form-${idx}`}
              >
                {openIndex === idx ? 'Cerrar' : 'Configurar'}
              </button>
            </div>
          </div>
          <div
            id={`integration-form-${idx}`}
            className={`transition-all duration-300 overflow-hidden ${openIndex === idx ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'} bg-gray-50 dark:bg-background p-0 rounded`}
          >
            {openIndex === idx && <div className="p-4">{renderForm(integration.name)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
