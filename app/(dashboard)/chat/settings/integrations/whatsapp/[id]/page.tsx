'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Key,
  Webhook,
  Phone,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks';
import type { WhatsAppConfig } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WhatsAppChannelConfigPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: channel, isLoading } = useChannel(id);
  const updateChannelMutation = useUpdateChannel();

  const [copied, setCopied] = useState<string | null>(null);
  const [config, setConfig] = useState<Partial<WhatsAppConfig>>({});

  useEffect(() => {
    if (channel?.config) {
      setConfig(channel.config as WhatsAppConfig);
    }
  }, [channel]);

  const whatsappConfig = config as WhatsAppConfig;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com';
  const webhookUrl = `${baseUrl}/api/whatsapp/webhook`;

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
      {
        id,
        input: { config, status: whatsappConfig.webhook_verified ? 'active' : 'pending' },
      },
      {
        onSuccess: () => {
          toast.success('Configuración guardada');
        },
      }
    );
  };

  const updateConfig = (key: keyof WhatsAppConfig, value: unknown) => {
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
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{channel.name}</h1>
                <p className="text-sm text-muted-foreground">Configuración de WhatsApp Business</p>
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
          {/* Status Card */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {whatsappConfig?.webhook_verified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600" />
                )}
                Estado de la conexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              {whatsappConfig?.webhook_verified ? (
                <Alert className="border-emerald-500/50 bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                    WhatsApp está conectado y listo para recibir mensajes
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <XCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Configura los datos de Meta Business para conectar WhatsApp
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Meta Configuration */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Configuración de Meta Business
              </CardTitle>
              <CardDescription>
                Obtén estos datos desde tu{' '}
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Panel de desarrolladores de Meta
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ID de la cuenta de WhatsApp Business</Label>
                <Input
                  placeholder="Ej: 123456789012345"
                  value={whatsappConfig?.business_account_id || ''}
                  onChange={(e) => updateConfig('business_account_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>ID del número de teléfono</Label>
                <Input
                  placeholder="Ej: 123456789012345"
                  value={whatsappConfig?.phone_number_id || ''}
                  onChange={(e) => updateConfig('phone_number_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Número de teléfono
                </Label>
                <Input
                  placeholder="Ej: +51999999999"
                  value={whatsappConfig?.phone_number || ''}
                  onChange={(e) => updateConfig('phone_number', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Número de WhatsApp Business conectado (con código de país)
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Access Token (permanente)
                </Label>
                <Input
                  type="password"
                  placeholder="EAAxxxxxxx..."
                  value={whatsappConfig?.access_token || ''}
                  onChange={(e) => updateConfig('access_token', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Token de acceso permanente generado en Meta Business
                </p>
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
                Configura estos valores en la sección de Webhooks de tu app de Meta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL del Webhook</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-sm" />
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

              <div className="space-y-2">
                <Label>Verify Token</Label>
                <div className="flex gap-2">
                  <Input value="mkt_whatsapp_verify_token" readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy('mkt_whatsapp_verify_token', 'verify')}
                  >
                    {copied === 'verify' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Campos del Webhook a suscribir:</strong>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>messages</li>
                    <li>message_deliveries</li>
                    <li>message_reads</li>
                    <li>messaging_postbacks</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="webhook_verified"
                  checked={whatsappConfig?.webhook_verified || false}
                  onChange={(e) => updateConfig('webhook_verified', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="webhook_verified" className="text-sm font-normal cursor-pointer">
                  He configurado el webhook en Meta y está verificado
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Pasos para conectar</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal ml-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  Crea una app en{' '}
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Meta for Developers
                  </a>{' '}
                  y agrega el producto "WhatsApp"
                </li>
                <li>
                  En "Configuración de la API", obtén el ID de la cuenta de negocio y el ID del
                  número de teléfono
                </li>
                <li>Genera un token de acceso permanente en "Tokens de acceso del sistema"</li>
                <li>
                  En la sección "Webhooks", configura la URL y el token de verificación mostrados
                  arriba
                </li>
                <li>Suscríbete a los campos de webhook listados</li>
                <li>Marca la casilla de webhook verificado y guarda la configuración</li>
              </ol>
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
