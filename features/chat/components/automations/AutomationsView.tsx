'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Plus, Clock, ArrowRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { AutomationStats } from './AutomationStats';
import { AutomationCard } from './AutomationCard';

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

// Mock data - en producción vendría de un hook
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

export function AutomationsView() {
  const [automations, setAutomations] = useState(mockAutomations);

  const handleToggle = (id: string) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <AutomationsHeader />

      {/* Stats */}
      <AutomationStats automations={automations} />

      {/* Automations List */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={() => handleToggle(automation.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function AutomationsHeader() {
  return (
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
  );
}
