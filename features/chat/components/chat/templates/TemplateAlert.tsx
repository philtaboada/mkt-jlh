'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateAlertProps {
  isOutsideHours?: boolean;
  isNotConnected?: boolean;
  channelId?: string;
}

export function TemplateAlert({ isOutsideHours, isNotConnected, channelId }: TemplateAlertProps) {
  console.log('TemplateAlert render', { isOutsideHours, isNotConnected, channelId });
  if (!channelId || (!isOutsideHours && !isNotConnected)) {
    return null;
  }

  const message = isNotConnected
    ? 'El canal de WhatsApp no está conectado. Para enviar mensajes, debe usar una plantilla aprobada.'
    : 'Está fuera del horario de atención de WhatsApp (24/7). Para enviar mensajes, debe usar una plantilla aprobada.';

  return (
    <Alert className="absolute z-10 mt-14 border-amber-200 bg-amber-50 p-2">
      <MessageSquare className="h-4 w-4 text-amber-800 mr-2" />
      <AlertDescription className="text-amber-700 text-xs flex items-center">
        {message}
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-xs ml-2 text-red-700 hover:text-red-900"
          onClick={() =>
            window.open(
              'https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/',
              '_blank'
            )
          }
        >
          Ver docs
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
