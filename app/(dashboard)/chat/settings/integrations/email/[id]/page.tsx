'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Server, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks';
import type { EmailConfig } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmailChannelConfigPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: channel, isLoading } = useChannel(id);
  const updateChannelMutation = useUpdateChannel();

  const [config, setConfig] = useState<Partial<EmailConfig>>({});

  useEffect(() => {
    if (channel?.config) {
      setConfig(channel.config as EmailConfig);
    }
  }, [channel]);

  const emailConfig = config as EmailConfig;

  const handleSaveConfig = () => {
    updateChannelMutation.mutate(
      { id, input: { config } },
      { onSuccess: () => toast.success('Configuración guardada') }
    );
  };

  const updateConfig = (key: keyof EmailConfig, value: unknown) => {
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

  const isConfigured = emailConfig?.email && emailConfig?.imap_host && emailConfig?.smtp_host;

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
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{channel.name}</h1>
                <p className="text-sm text-muted-foreground">Configuración de Email IMAP/SMTP</p>
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
                {isConfigured ? (
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
                  isConfigured
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-amber-500/50 bg-amber-500/10'
                }
              >
                <AlertDescription>
                  {isConfigured
                    ? 'Email está configurado'
                    : 'Configura los datos de tu servidor de correo'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Email Account */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Cuenta de correo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dirección de correo</Label>
                <Input
                  type="email"
                  placeholder="soporte@miempresa.com"
                  value={emailConfig?.email || ''}
                  onChange={(e) => updateConfig('email', e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Input
                    placeholder="soporte@miempresa.com"
                    value={emailConfig?.username || ''}
                    onChange={(e) => updateConfig('username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={emailConfig?.password || ''}
                    onChange={(e) => updateConfig('password', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IMAP Configuration */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5" />
                Configuración IMAP (recepción)
              </CardTitle>
              <CardDescription>Para recibir correos entrantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Servidor IMAP</Label>
                  <Input
                    placeholder="imap.gmail.com"
                    value={emailConfig?.imap_host || ''}
                    onChange={(e) => updateConfig('imap_host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puerto IMAP</Label>
                  <Input
                    type="number"
                    placeholder="993"
                    value={emailConfig?.imap_port || ''}
                    onChange={(e) => updateConfig('imap_port', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Configuration */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5" />
                Configuración SMTP (envío)
              </CardTitle>
              <CardDescription>Para enviar correos salientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={emailConfig?.smtp_host || ''}
                    onChange={(e) => updateConfig('smtp_host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puerto SMTP</Label>
                  <Input
                    type="number"
                    placeholder="587"
                    value={emailConfig?.smtp_port || ''}
                    onChange={(e) => updateConfig('smtp_port', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Configs */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuraciones comunes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Gmail</p>
                  <p className="text-muted-foreground">IMAP: imap.gmail.com:993</p>
                  <p className="text-muted-foreground">SMTP: smtp.gmail.com:587</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Outlook/Office 365</p>
                  <p className="text-muted-foreground">IMAP: outlook.office365.com:993</p>
                  <p className="text-muted-foreground">SMTP: smtp.office365.com:587</p>
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
