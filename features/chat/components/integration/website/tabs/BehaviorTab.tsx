'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';

interface BehaviorTabProps {
  widgetConfig: WebsiteWidgetConfig;
  updateConfig: (key: keyof WebsiteWidgetConfig, value: unknown) => void;
}

export function BehaviorTab({ widgetConfig, updateConfig }: BehaviorTabProps) {
  return (
    <>
      {/* Reply Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tiempo de respuesta</CardTitle>
          <CardDescription>Indica a los visitantes cuánto tardarás en responder</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={widgetConfig?.reply_time || 'few_minutes'}
            onValueChange={(value) => updateConfig('reply_time', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="few_minutes">En unos minutos</SelectItem>
              <SelectItem value="few_hours">En unas horas</SelectItem>
              <SelectItem value="one_day">En un día</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Pre-chat Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Formulario pre-chat</CardTitle>
              <CardDescription>
                Solicita información antes de iniciar la conversación
              </CardDescription>
            </div>
            <Switch
              checked={widgetConfig?.pre_chat_form_enabled ?? true}
              onCheckedChange={(checked) => updateConfig('pre_chat_form_enabled', checked)}
            />
          </div>
        </CardHeader>
        {widgetConfig?.pre_chat_form_enabled && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Input value="Nombre" disabled className="flex-1" />
                <Badge variant="secondary">Obligatorio</Badge>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Input value="Correo electrónico" disabled className="flex-1" />
                <Badge variant="secondary">Obligatorio</Badge>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Input value="WhatsApp" disabled className="flex-1" />
                <Badge variant="outline">Opcional</Badge>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Input value="RUC" disabled className="flex-1" />
                <Badge variant="outline">Opcional</Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Online Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado en línea</CardTitle>
          <CardDescription>Controla cuándo mostrar que estás disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={widgetConfig?.online_status || 'auto'}
            onValueChange={(value) => updateConfig('online_status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automático (según agentes conectados)</SelectItem>
              <SelectItem value="online">Siempre en línea</SelectItem>
              <SelectItem value="offline">Siempre fuera de línea</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </>
  );
}
