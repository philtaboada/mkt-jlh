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
            <CardContent className="space-y-5">
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                  <strong>Datos requeridos:</strong> Todos estos campos son necesarios para conectar
                  WhatsApp Business correctamente
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  ID de la cuenta de WhatsApp Business
                </Label>
                <p className="text-xs text-muted-foreground">
                  Lo encontrarás en Meta Business Suite → Configuración → ID de la cuenta
                </p>
                <Input
                  placeholder="Ej: 123456789012345"
                  value={whatsappConfig?.business_account_id || ''}
                  onChange={(e) => updateConfig('business_account_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">ID del número de teléfono</Label>
                <p className="text-xs text-muted-foreground">
                  Aparece en Meta Business Suite → WhatsApp → Configuración de la API
                </p>
                <Input
                  placeholder="Ej: 123456789012345"
                  value={whatsappConfig?.phone_number_id || ''}
                  onChange={(e) => updateConfig('phone_number_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Phone className="w-4 h-4" />
                  Número de teléfono
                </Label>
                <p className="text-xs text-muted-foreground">
                  Número de WhatsApp Business (incluye código de país, ej: +51 para Perú)
                </p>
                <Input
                  placeholder="Ej: +51999999999"
                  value={whatsappConfig?.phone_number || ''}
                  onChange={(e) => updateConfig('phone_number', e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="w-4 h-4" />
                  Access Token (permanente)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Generado en Meta Business Suite → Configuración de Apps → Tokens
                </p>
                <Input
                  type="password"
                  placeholder="EAAxxxxxxx..."
                  value={whatsappConfig?.access_token || ''}
                  onChange={(e) => updateConfig('access_token', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="w-4 h-4" />
                  Token de Verificación
                </Label>
                <p className="text-xs text-muted-foreground">
                  Token personalizado que creaste para validar el webhook. Lo necesitarás más abajo
                  en "Configuración del Webhook"
                </p>
                <Input
                  type="password"
                  placeholder="Tu token de verificación personalizado"
                  value={whatsappConfig?.verify_token || ''}
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
                Copia estos valores exactos en la sección de Webhooks de tu app en Meta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  <strong>Instrucciones:</strong> Ve a tu app de Meta → Configuración → Webhooks y
                  copia los valores de abajo en los campos correspondientes
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-base font-semibold">1. URL del Webhook</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Copia este valor en el campo "URL de Callback" en Meta
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
                <p className="text-xs text-muted-foreground mb-2">
                  Copia este valor en el campo "Verify Token" en Meta
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Tu token de verificación"
                    value={whatsappConfig?.verify_token || ''}
                    onChange={(e) => updateConfig('verify_token', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(whatsappConfig?.verify_token || '', 'verify')}
                  >
                    {copied === 'verify' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-semibold">3. Campos de Webhook a suscribir</Label>
                <p className="text-xs text-muted-foreground">
                  En Meta, selecciona estos campos en "Campos de webhook":
                </p>
                <Alert>
                  <AlertDescription className="text-sm">
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        <code className="bg-muted px-2 py-1 rounded text-xs">messages</code> - Para
                        recibir mensajes
                      </li>
                      <li>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          message_deliveries
                        </code>{' '}
                        - Confirmación de entrega
                      </li>
                      <li>
                        <code className="bg-muted px-2 py-1 rounded text-xs">message_reads</code> -
                        Confirmación de lectura
                      </li>
                      <li>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          messaging_postbacks
                        </code>{' '}
                        - Respuestas de botones
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

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
