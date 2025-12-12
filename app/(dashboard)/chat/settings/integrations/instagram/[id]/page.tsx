'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Instagram, ExternalLink, Key, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks';
import type { InstagramConfig } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstagramChannelConfigPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: channel, isLoading } = useChannel(id);
  const updateChannelMutation = useUpdateChannel();

  const [config, setConfig] = useState<Partial<InstagramConfig>>({});

  useEffect(() => {
    if (channel?.config) {
      setConfig(channel.config as InstagramConfig);
    }
  }, [channel]);

  const instagramConfig = config as InstagramConfig;

  const handleSaveConfig = () => {
    updateChannelMutation.mutate(
      { id, input: { config } },
      { onSuccess: () => toast.success('Configuración guardada') }
    );
  };

  const updateConfig = (key: keyof InstagramConfig, value: unknown) => {
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
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{channel.name}</h1>
                <p className="text-sm text-muted-foreground">Configuración de Instagram DM</p>
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
                {instagramConfig?.access_token ? (
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
                  instagramConfig?.access_token
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-amber-500/50 bg-amber-500/10'
                }
              >
                <AlertDescription>
                  {instagramConfig?.access_token
                    ? 'Instagram DM está conectado'
                    : 'Configura los datos de tu cuenta de Instagram Business'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Instagram</CardTitle>
              <CardDescription>
                Requiere una cuenta de Instagram Business conectada a una página de Facebook.{' '}
                <a
                  href="https://developers.facebook.com/docs/instagram-api/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Ver documentación
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ID de la Cuenta de Instagram</Label>
                <Input
                  placeholder="Ej: 17841400000000000"
                  value={instagramConfig?.account_id || ''}
                  onChange={(e) => updateConfig('account_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Nombre de usuario</Label>
                <Input
                  placeholder="@miempresa"
                  value={instagramConfig?.username || ''}
                  onChange={(e) => updateConfig('username', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Access Token
                </Label>
                <Input
                  type="password"
                  placeholder="IGQxxxxxxx..."
                  value={instagramConfig?.access_token || ''}
                  onChange={(e) => updateConfig('access_token', e.target.value)}
                />
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
