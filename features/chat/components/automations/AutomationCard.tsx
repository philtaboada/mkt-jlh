'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Zap, Clock, ArrowRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

interface AutomationCardProps {
  automation: Automation;
  onToggle: () => void;
}

export function AutomationCard({ automation, onToggle }: AutomationCardProps) {
  return (
    <Card className={`border-border transition-all ${!automation.isActive && 'opacity-60'}`}>
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
            <Switch checked={automation.isActive} onCheckedChange={onToggle} />
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
