'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Code2, TestTube, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
      // Construir la URL de validación usando la URL del sitio web
      const baseUrl = url.replace(/\/$/, ''); // Remover trailing slash
      const testUrl = `${baseUrl}/api/chat/widget/config?token=${widgetConfig.widget_token}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setValidationResult({
          status: 'success',
          message: 'Conexión exitosa. El widget está funcionando correctamente en esta URL.',
        });
        toast.success('URL validada correctamente');
      } else if (response.status === 404) {
        setValidationResult({
          status: 'error',
          message: 'No se encontró el endpoint. Verifica que el código del widget esté instalado correctamente en tu sitio.',
        });
        toast.error('No se pudo validar la URL');
      } else if (response.status === 401 || response.status === 403) {
        setValidationResult({
          status: 'error',
          message: 'Token inválido o no autorizado. Verifica que el token sea correcto.',
        });
        toast.error('Error de autenticación');
      } else {
        setValidationResult({
          status: 'error',
          message: `Error del servidor (${response.status}). Verifica que tu sitio esté funcionando correctamente.`,
        });
        toast.error('Error al validar la URL');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setValidationResult({
          status: 'error',
          message: 'Tiempo de espera agotado. Verifica que la URL sea accesible y que el widget esté instalado.',
        });
        toast.error('Timeout: La URL no respondió a tiempo');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        setValidationResult({
          status: 'error',
          message: 'Error de conexión. Verifica que la URL sea correcta y que no haya problemas de CORS.',
        });
        toast.error('Error de conexión');
      } else {
        setValidationResult({
          status: 'error',
          message: 'Error inesperado al validar la URL. Por favor intenta de nuevo.',
        });
        toast.error('Error al validar');
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
