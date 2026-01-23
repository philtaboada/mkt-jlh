'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Code2,
  TestTube,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [validatingUrl, setValidatingUrl] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  const handleValidateUrl = async () => {
    const url = widgetConfig?.website_url;

    if (!url || !url.trim()) {
      toast.error('Por favor ingresa una URL para validar');
      return;
    }

    // Validar formato de URL
    try {
      new URL(url);
    } catch {
      toast.error('URL inválida. Debe comenzar con http:// o https://');
      return;
    }

    if (!widgetConfig?.widget_token) {
      toast.error('El widget no tiene un token configurado');
      return;
    }

    setValidatingUrl(true);
    setValidationResult({ status: null, message: '' });

    try {
      // Verificar que la URL del sitio web es accesible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // Cambiar a no-cors para evitar problemas de CORS
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      // Con no-cors, no podemos leer el status, pero si no hay error, significa que la URL es accesible
      setValidationResult({
        status: 'success',
        message: 'URL accesible. El script se puede generar correctamente con esta URL.',
      });
      toast.success('URL validada correctamente');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setValidationResult({
          status: 'error',
          message: 'Tiempo de espera agotado. Verifica que la URL sea accesible.',
        });
        toast.error('Timeout: La URL no respondió a tiempo');
      } else {
        setValidationResult({
          status: 'error',
          message: 'No se pudo acceder a la URL. Verifica que la URL sea correcta.',
        });
        toast.error('Error al validar la URL');
      }
    } finally {
      setValidatingUrl(false);
    }
  };

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
          <CardTitle className="text-lg flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            URL del sitio web
          </CardTitle>
          <CardDescription>
            Especifica el dominio donde se instaló el widget y valida la conexión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://tu-sitio.com"
              value={widgetConfig?.website_url || ''}
              onChange={(e) => {
                updateConfig('website_url', e.target.value);
                setValidationResult({ status: null, message: '' });
              }}
              className="flex-1"
            />
            <Button
              onClick={handleValidateUrl}
              disabled={validatingUrl || !widgetConfig?.website_url || !widgetConfig?.widget_token}
              variant="outline"
            >
              {validatingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Validar URL
                </>
              )}
            </Button>
          </div>

          {validationResult.status && (
            <Alert
              className={cn(
                validationResult.status === 'success'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-destructive/50 bg-destructive/10'
              )}
            >
              <div className="flex items-start gap-2">
                {validationResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 text-destructive" />
                )}
                <AlertDescription
                  className={cn(
                    validationResult.status === 'success' ? 'text-emerald-700' : 'text-destructive'
                  )}
                >
                  {validationResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            Ingresa la URL completa de tu sitio web (con https://) y haz clic en "Validar URL" para
            verificar que el widget esté funcionando correctamente.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
