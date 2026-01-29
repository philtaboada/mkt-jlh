'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Key,
  Webhook,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks';
import TikTokForm from '@/features/chat/components/integration/TikTokForm';
import type { TikTokConfig } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TikTokChannelConfigPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: channel, isLoading } = useChannel(id);
  const updateChannelMutation = useUpdateChannel();

  const [copied, setCopied] = useState<string | null>(null);
  const [config, setConfig] = useState<Partial<TikTokConfig>>({});

  useEffect(() => {
    if (channel?.config) {
      setConfig(channel.config as TikTokConfig);
    }
  }, [channel]);

  const tiktokConfig = config as TikTokConfig;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com';
  const webhookUrl = `${baseUrl}/api/tiktok/webhook`;

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success('Copiado al portapapeles');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handleSaveConfig = () => {
    updateChannelMutation.mutate(
      { id, input: { config, status: tiktokConfig?.access_token ? 'active' : 'pending' } },
      { onSuccess: () => toast.success('Configuración guardada') }
    );
  };

  const updateConfig = (key: keyof TikTokConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Cargando configuración...</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Canal no encontrado</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat/settings/integrations">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Music className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{channel.name}</h1>
                <p className="text-sm text-muted-foreground">Configuración de TikTok</p>
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              channel.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-amber-500/10 text-amber-600'
            )}
          >
            {channel.status === 'active' ? 'Conectado' : 'Pendiente'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {tiktokConfig?.access_token ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600" />
                )}
                Estado de la conexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert
                className={
                  tiktokConfig?.access_token
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-amber-500/50 bg-amber-500/10'
                }
              >
                <AlertDescription>
                  {tiktokConfig?.access_token
                    ? 'TikTok está conectado'
                    : 'Configura los datos de tu cuenta de TikTok'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuración de TikTok</CardTitle>
              <CardDescription>
                Obtén las credenciales desde la plataforma de desarrolladores de TikTok.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                  <strong>Datos requeridos:</strong> Todos estos campos son necesarios para conectar
                  TikTok correctamente
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Account ID</Label>
                <p className="text-xs text-muted-foreground">ID de la cuenta de TikTok</p>
                <Input
                  placeholder="Ej: 123456789"
                  value={tiktokConfig?.account_id || ''}
                  onChange={(e) => updateConfig('account_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Usuario</Label>
                <p className="text-xs text-muted-foreground">Nombre de usuario de TikTok</p>
                <Input
                  placeholder="@miusuario"
                  value={tiktokConfig?.username || ''}
                  onChange={(e) => updateConfig('username', e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="w-4 h-4" />
                  App ID
                </Label>
                <Input
                  placeholder="App ID"
                  value={tiktokConfig?.app_id || ''}
                  onChange={(e) => updateConfig('app_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="w-4 h-4" />
                  App Secret
                </Label>
                <Input
                  type="password"
                  placeholder="App Secret"
                  value={tiktokConfig?.app_secret || ''}
                  onChange={(e) => updateConfig('app_secret', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="w-4 h-4" />
                  Access Token
                </Label>
                <Input
                  type="password"
                  placeholder="EAAxxxxxxx..."
                  value={tiktokConfig?.access_token || ''}
                  onChange={(e) => updateConfig('access_token', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="w-4 h-4" />
                  Token de Verificación
                </Label>
                <Input
                  type="password"
                  placeholder="Tu token de verificación personalizado"
                  value={tiktokConfig?.verify_token || ''}
                  onChange={(e) => updateConfig('verify_token', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Configuración del Webhook
              </CardTitle>
              <CardDescription>
                Copia estos valores exactos en la sección de Webhooks de tu app en TikTok
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  <strong>Instrucciones:</strong> Ve a tu app de TikTok for Developers y copia los
                  valores de abajo en los campos correspondientes
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-base font-semibold">1. URL del Webhook</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Copia este valor en el campo "URL de Callback" en TikTok
                </p>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-sm bg-muted" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(webhookUrl, 'webhook')}
                  >
                    {copied === 'webhook' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base font-semibold">2. Verify Token</Label>
                <p className="text-xs text-muted-foreground mb-2">Copia este valor en TikTok</p>
                <div className="flex gap-2">
                  <Input
                    value={tiktokConfig?.verify_token || ''}
                    readOnly
                    className="font-mono text-sm bg-muted"
                    placeholder="Configura el token en la sección de arriba"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(tiktokConfig?.verify_token || '', 'verify')}
                  >
                    {copied === 'verify' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveConfig} disabled={updateChannelMutation.isPending}>
              {updateChannelMutation.isPending ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
