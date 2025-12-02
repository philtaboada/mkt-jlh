'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  Plus,
  Globe,
  Smartphone,
  Facebook,
  Instagram,
  Mail,
  MoreVertical,
  Settings2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Power,
  PowerOff,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  useChannels,
  useCreateChannel,
  useDeleteChannel,
  useUpdateChannel,
} from '@/features/chat/hooks';
import type { Channel, ChannelType } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const channelTypes = [
  {
    type: 'website' as ChannelType,
    name: 'Website',
    description: 'Agrega un widget de chat en tu sitio web',
    icon: Globe,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    type: 'whatsapp' as ChannelType,
    name: 'WhatsApp',
    description: 'Conecta tu número de WhatsApp Business',
    icon: Smartphone,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    type: 'facebook' as ChannelType,
    name: 'Facebook Messenger',
    description: 'Atiende mensajes desde tu página de Facebook',
    icon: Facebook,
    color: 'bg-indigo-500/10 text-indigo-600',
  },
  {
    type: 'instagram' as ChannelType,
    name: 'Instagram DM',
    description: 'Conecta tu cuenta de Instagram Business',
    icon: Instagram,
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    type: 'email' as ChannelType,
    name: 'Email',
    description: 'Configura bandejas de entrada por correo',
    icon: Mail,
    color: 'bg-amber-500/10 text-amber-600',
  },
];

const statusConfig = {
  active: { label: 'Activo', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600' },
  pending: { label: 'Pendiente', icon: Clock, color: 'bg-amber-500/10 text-amber-600' },
  inactive: { label: 'Inactivo', icon: XCircle, color: 'bg-destructive/10 text-destructive' },
};

export default function ChannelsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ChannelType | null>(null);
  const [channelName, setChannelName] = useState('');
  const [validatingChannel, setValidatingChannel] = useState<string | null>(null);

  const { data: channels = [], isLoading } = useChannels();
  const createChannelMutation = useCreateChannel();
  const deleteChannelMutation = useDeleteChannel();
  const updateChannelMutation = useUpdateChannel();

  const handleCreateChannel = () => {
    if (!selectedType || !channelName.trim()) return;

    createChannelMutation.mutate(
      {
        name: channelName,
        type: selectedType,
        config: {},
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setSelectedType(null);
          setChannelName('');
        },
      }
    );
  };

  const handleDeleteChannel = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este canal?')) {
      deleteChannelMutation.mutate(id);
    }
  };

  const handleToggleStatus = (channel: Channel) => {
    const newStatus = channel.status === 'active' ? 'inactive' : 'active';
    updateChannelMutation.mutate(
      {
        id: channel.id,
        input: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(
            newStatus === 'active'
              ? 'Canal activado correctamente'
              : 'Canal desactivado correctamente'
          );
        },
      }
    );
  };

  const handleValidateChannel = async (channel: Channel) => {
    setValidatingChannel(channel.id);

    try {
      // Para canales de tipo website, validamos que el widget_token exista y funcione
      if (channel.type === 'website') {
        const config = channel.config as { widget_token?: string };
        if (!config?.widget_token) {
          toast.error('El canal no tiene un token configurado');
          setValidatingChannel(null);
          return;
        }

        // Hacer una petición de prueba al endpoint del widget
        const response = await fetch(`/api/chat/widget/config?token=${config.widget_token}`);

        if (response.ok) {
          // Si funciona, activar el canal
          updateChannelMutation.mutate(
            {
              id: channel.id,
              input: { status: 'active' },
            },
            {
              onSuccess: () => {
                toast.success('Canal validado y activado correctamente');
              },
            }
          );
        } else {
          toast.error('No se pudo validar el canal. Verifica la configuración.');
        }
      } else {
        // Para otros tipos de canales, simplemente activamos
        updateChannelMutation.mutate(
          {
            id: channel.id,
            input: { status: 'active' },
          },
          {
            onSuccess: () => {
              toast.success('Canal activado correctamente');
            },
          }
        );
      }
    } catch (error) {
      toast.error('Error al validar el canal');
      console.error('Validation error:', error);
    } finally {
      setValidatingChannel(null);
    }
  };

  const getChannelIcon = (type: ChannelType) => {
    const config = channelTypes.find((c) => c.type === type);
    return config?.icon || MessageSquare;
  };

  const getChannelColor = (type: ChannelType) => {
    const config = channelTypes.find((c) => c.type === type);
    return config?.color || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Canales</h1>
                <p className="text-sm text-muted-foreground">
                  Gestiona tus canales de comunicación
                </p>
              </div>
            </div>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Canal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear nuevo canal</DialogTitle>
                <DialogDescription>
                  Selecciona el tipo de canal que deseas configurar
                </DialogDescription>
              </DialogHeader>

              {!selectedType ? (
                <div className="grid gap-3 py-4">
                  {channelTypes.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <button
                        key={channel.type}
                        onClick={() => setSelectedType(channel.type)}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors text-left"
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            channel.color
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{channel.name}</p>
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {(() => {
                      const config = channelTypes.find((c) => c.type === selectedType);
                      const Icon = config?.icon || MessageSquare;
                      return (
                        <>
                          <div
                            className={cn(
                              'w-8 h-8 rounded flex items-center justify-center',
                              config?.color
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{config?.name}</span>
                        </>
                      );
                    })()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setSelectedType(null)}
                    >
                      Cambiar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del canal</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Chat de soporte"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedType(null);
                        setChannelName('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateChannel}
                      disabled={!channelName.trim() || createChannelMutation.isPending}
                    >
                      {createChannelMutation.isPending ? 'Creando...' : 'Crear Canal'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando canales...</div>
          ) : channels.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay canales configurados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primer canal para comenzar a recibir conversaciones
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Canal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {channels.map((channel: Channel) => {
                const Icon = getChannelIcon(channel.type);
                const status = statusConfig[channel.status];
                const StatusIcon = status.icon;

                return (
                  <Card key={channel.id} className="bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              getChannelColor(channel.type)
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{channel.name}</CardTitle>
                            <CardDescription className="text-xs capitalize">
                              {channel.type}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn('text-xs', status.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/chat/settings/integrations/${channel.type}/${channel.id}`}
                                >
                                  <Settings2 className="w-4 h-4 mr-2" />
                                  Configurar
                                </Link>
                              </DropdownMenuItem>

                              {channel.status === 'pending' && (
                                <DropdownMenuItem
                                  onClick={() => handleValidateChannel(channel)}
                                  disabled={validatingChannel === channel.id}
                                >
                                  {validatingChannel === channel.id ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                  )}
                                  Validar y activar
                                </DropdownMenuItem>
                              )}

                              {channel.status !== 'pending' && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(channel)}>
                                  {channel.status === 'active' ? (
                                    <>
                                      <PowerOff className="w-4 h-4 mr-2" />
                                      Desactivar
                                    </>
                                  ) : (
                                    <>
                                      <Power className="w-4 h-4 mr-2" />
                                      Activar
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteChannel(channel.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    {channel.type === 'website' && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <span>Widget disponible para embeber en tu sitio</span>
                          <Link
                            href={`/chat/settings/integrations/website/${channel.id}`}
                            className="text-primary hover:underline ml-auto"
                          >
                            Ver código
                          </Link>
                        </div>
                      </CardContent>
                    )}
                    {channel.type === 'whatsapp' && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Smartphone className="w-3 h-3" />
                          <span>
                            {(channel.config as any)?.phone_number || 'Número no configurado'}
                          </span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Available Integrations */}
          <div className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Canales disponibles</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {channelTypes.map((channel) => {
                const Icon = channel.icon;
                const existingCount = channels.filter(
                  (c: Channel) => c.type === channel.type
                ).length;

                return (
                  <button
                    key={channel.type}
                    onClick={() => {
                      setSelectedType(channel.type);
                      setCreateDialogOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors text-left bg-card"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        channel.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.description}</p>
                    </div>
                    {existingCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {existingCount} activo{existingCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
