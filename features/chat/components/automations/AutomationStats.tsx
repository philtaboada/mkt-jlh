'use client';

import { Card, CardContent } from '@/components/ui/card';

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

interface AutomationStatsProps {
  automations: Automation[];
}

export function AutomationStats({ automations }: AutomationStatsProps) {
  return (
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
  );
}
