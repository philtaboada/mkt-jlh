'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap,
  Plus,
  MessageSquare,
  Clock,
  Tag,
  UserPlus,
  Mail,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: Date;
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Respuesta automática fuera de horario',
    description:
      'Envía un mensaje automático cuando se recibe una conversación fuera del horario laboral',
    trigger: 'Nueva conversación fuera de horario',
    actions: ['Enviar mensaje', 'Asignar etiqueta'],
    isActive: true,
    executionCount: 156,
    lastExecuted: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    name: 'Asignar agente por canal',
    description: 'Asigna automáticamente las conversaciones de WhatsApp al equipo de soporte',
    trigger: 'Nueva conversación de WhatsApp',
    actions: ['Asignar a equipo'],
    isActive: true,
    executionCount: 89,
    lastExecuted: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    name: 'Etiquetar por palabra clave',
    description: 'Añade etiquetas basadas en palabras clave detectadas en el mensaje',
    trigger: 'Mensaje con palabra clave',
    actions: ['Asignar etiqueta', 'Notificar agente'],
    isActive: false,
    executionCount: 45,
  },
  {
    id: '4',
    name: 'Cerrar conversaciones inactivas',
    description: 'Cierra automáticamente las conversaciones sin actividad en 24 horas',
    trigger: 'Conversación inactiva 24h',
    actions: ['Enviar mensaje', 'Cerrar conversación'],
    isActive: true,
    executionCount: 234,
    lastExecuted: new Date(Date.now() - 1000 * 60 * 60),
  },
];

const triggerIcons: Record<string, React.ElementType> = {
  'Nueva conversación': MessageSquare,
  'Mensaje con palabra clave': Tag,
  'Conversación inactiva': Clock,
  default: Zap,
};

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(mockAutomations);

  const handleToggle = (id: string) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Automatizaciones</h1>
              <p className="text-sm text-muted-foreground">
                Automatiza tareas repetitivas en tu inbox
              </p>
            </div>
          </div>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva automatización
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-border bg-card">
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{automations.length}</div>
            <p className="text-sm text-muted-foreground">Total automatizaciones</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">
              {automations.filter((a) => a.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">
              {automations.reduce((acc, a) => acc + a.executionCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Ejecuciones totales</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">~2.5h</div>
            <p className="text-sm text-muted-foreground">Tiempo ahorrado/semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {automations.map((automation) => (
            <Card
              key={automation.id}
              className={`border-border transition-all ${!automation.isActive && 'opacity-60'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      automation.isActive ? 'bg-amber-500/10' : 'bg-muted'
                    }`}
                  >
                    <Zap
                      className={`w-5 h-5 ${
                        automation.isActive ? 'text-amber-600' : 'text-muted-foreground'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{automation.name}</h3>
                      {automation.isActive && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">Activa</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{automation.description}</p>

                    {/* Trigger and Actions */}
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="font-normal">
                        <Clock className="w-3 h-3 mr-1" />
                        {automation.trigger}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      {automation.actions.map((action, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">
                          {action}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{automation.executionCount} ejecuciones</span>
                      {automation.lastExecuted && (
                        <span>Última: {formatTime(automation.lastExecuted)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => handleToggle(automation.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
