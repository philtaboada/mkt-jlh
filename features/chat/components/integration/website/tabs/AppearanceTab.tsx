'use client';

import { Palette, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { colorPresets } from '@/features/chat/constants';
import { cn } from '@/lib/utils';

interface AppearanceTabProps {
  widgetConfig: WebsiteWidgetConfig;
  updateConfig: (key: keyof WebsiteWidgetConfig, value: unknown) => void;
}

export function AppearanceTab({ widgetConfig, updateConfig }: AppearanceTabProps) {
  return (
    <>
      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color del widget
          </CardTitle>
          <CardDescription>Personaliza el color principal del chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => updateConfig('widget_color', color.value)}
                className={cn(
                  'w-10 h-10 rounded-full transition-all',
                  widgetConfig?.widget_color === color.value && 'ring-2 ring-offset-2 ring-primary'
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Color personalizado:</Label>
            <Input
              type="color"
              className="w-12 h-8 p-0 border-0"
              value={widgetConfig?.widget_color || '#3B82F6'}
              onChange={(e) => updateConfig('widget_color', e.target.value)}
            />
            <Input
              className="w-28"
              value={widgetConfig?.widget_color || '#3B82F6'}
              onChange={(e) => updateConfig('widget_color', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Posición del widget</CardTitle>
          <CardDescription>Elige dónde aparecerá el botón de chat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={() => updateConfig('position', 'left')}
              className={cn(
                'flex-1 p-4 border rounded-lg transition-colors',
                widgetConfig?.position === 'left'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="h-24 bg-muted rounded relative">
                <div
                  className="absolute bottom-2 left-2 w-8 h-8 rounded-full"
                  style={{ backgroundColor: widgetConfig?.widget_color || '#3B82F6' }}
                />
              </div>
              <p className="text-sm font-medium mt-2 text-center">Izquierda</p>
            </button>
            <button
              onClick={() => updateConfig('position', 'right')}
              className={cn(
                'flex-1 p-4 border rounded-lg transition-colors',
                widgetConfig?.position === 'right' || !widgetConfig?.position
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="h-24 bg-muted rounded relative">
                <div
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full"
                  style={{ backgroundColor: widgetConfig?.widget_color || '#3B82F6' }}
                />
              </div>
              <p className="text-sm font-medium mt-2 text-center">Derecha</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mensaje de bienvenida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Chatea con nosotros"
              value={widgetConfig?.welcome_title || ''}
              onChange={(e) => updateConfig('welcome_title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea
              placeholder="¡Hola! 👋 ¿En qué podemos ayudarte?"
              value={widgetConfig?.welcome_message || ''}
              onChange={(e) => updateConfig('welcome_message', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
