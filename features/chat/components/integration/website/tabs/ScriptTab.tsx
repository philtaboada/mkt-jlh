'use client';

import { Copy, Check, RefreshCw, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';

interface ScriptTabProps {
  widgetConfig: WebsiteWidgetConfig;
  scriptCode: string;
  copied: boolean;
  onCopy: () => void;
  onRegenerateToken: () => void;
  isRegenerating: boolean;
  updateConfig: (key: keyof WebsiteWidgetConfig, value: unknown) => void;
}

export function ScriptTab({
  widgetConfig,
  scriptCode,
  copied,
  onCopy,
  onRegenerateToken,
  isRegenerating,
  updateConfig,
}: ScriptTabProps) {
  return (
    <>
      {/* Installation Script */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Código de instalación
          </CardTitle>
          <CardDescription>
            Copia este código y pégalo antes de la etiqueta {'</body>'} en tu sitio web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono">
              <code className="text-foreground">{scriptCode}</code>
            </pre>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onCopy}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Token del widget</p>
              <p className="text-xs text-muted-foreground font-mono">
                {widgetConfig?.widget_token || 'No generado'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateToken}
              disabled={isRegenerating}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isRegenerating && 'animate-spin')} />
              Regenerar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Website URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">URL del sitio web</CardTitle>
          <CardDescription>
            Especifica el dominio donde se instalará el widget (opcional, para seguridad)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="https://tu-sitio.com"
            value={widgetConfig?.website_url || ''}
            onChange={(e) => updateConfig('website_url', e.target.value)}
          />
        </CardContent>
      </Card>
    </>
  );
}
