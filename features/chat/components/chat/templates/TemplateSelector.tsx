'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, Check, RefreshCw } from 'lucide-react';
import type { MessageTemplate } from '../../../types/template';
import { cn } from '@/lib/utils';
import { syncTemplates } from '../../../api/template.api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface TemplateSelectorProps {
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate, params?: Record<string, string>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  channelId?: string;
  onSyncComplete?: () => void;
}

export function TemplateSelector({
  templates,
  onSelect,
  isLoading = false,
  disabled = false,
  channelId,
  onSyncComplete,
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const approvedTemplates = templates.filter((t) => t.status === 'APPROVED');

  // Extraer placeholders de una plantilla
  const extractPlaceholders = (template: MessageTemplate): Array<{ index: number; component: 'BODY' | 'HEADER'; label: string }> => {
    const placeholders: Array<{ index: number; component: 'BODY' | 'HEADER'; label: string }> = [];
    
    template.components.forEach((comp) => {
      if ((comp.type === 'BODY' || comp.type === 'HEADER') && comp.text) {
        const matches = comp.text.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach((match) => {
          const index = parseInt(match.replace(/\{\{|\}\}/g, ''), 10);
          if (!placeholders.find((p) => p.index === index && p.component === comp.type)) {
            placeholders.push({
              index,
              component: comp.type as 'BODY' | 'HEADER',
              label: `${comp.type === 'HEADER' ? 'Encabezado' : 'Cuerpo'} - Parámetro ${index}`,
            });
          }
        });
      }
    });

    return placeholders.sort((a, b) => a.index - b.index);
  };

  // Verificar si una plantilla requiere parámetros
  const templateRequiresParams = (template: MessageTemplate): boolean => {
    return extractPlaceholders(template).length > 0;
  };

  const handleSync = async () => {
    if (!channelId) {
      toast.error('No se puede sincronizar: canal no especificado');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncTemplates({ channelId });
      
      if (result.success) {
        toast.success(`Sincronización completada: ${result.synced} plantillas sincronizadas`);
        queryClient.invalidateQueries({ queryKey: ['templates', channelId, 'whatsapp'] });
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        toast.error(result.error || 'Error al sincronizar plantillas');
      }
    } catch (error) {
      console.error('Error syncing templates:', error);
      toast.error('Error al sincronizar plantillas');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    
    // Si la plantilla requiere parámetros, mostrar diálogo
    if (templateRequiresParams(template)) {
      setTemplateParams({});
      setShowParamsDialog(true);
      setOpen(false);
    } else {
      // Si no requiere parámetros, seleccionar directamente
      onSelect(template);
      setOpen(false);
    }
  };

  const handleConfirmParams = () => {
    if (!selectedTemplate) return;
    
    // Validar que todos los parámetros requeridos estén llenos
    const placeholders = extractPlaceholders(selectedTemplate);
    const missingParams = placeholders.filter(
      (p) => !templateParams[`param_${p.index}`]?.trim()
    );

    if (missingParams.length > 0) {
      toast.error('Por favor completa todos los parámetros requeridos');
      return;
    }

    onSelect(selectedTemplate, templateParams);
    setShowParamsDialog(false);
    setTemplateParams({});
  };

  const selectedTemplatePlaceholders = useMemo(() => {
    if (!selectedTemplate) return [];
    return extractPlaceholders(selectedTemplate);
  }, [selectedTemplate]);

  const getTemplatePreview = (template: MessageTemplate): string => {
    const bodyComponent = template.components.find((c) => c.type === 'BODY');
    if (bodyComponent?.text) {
      return bodyComponent.text.substring(0, 60) + (bodyComponent.text.length > 60 ? '...' : '');
    }
    return template.name;
  };

  if (approvedTemplates.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoading}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Plantillas
          {selectedTemplate && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({selectedTemplate.name})
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">Seleccionar Plantilla</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {approvedTemplates.length} plantilla{approvedTemplates.length !== 1 ? 's' : ''} disponible{approvedTemplates.length !== 1 ? 's' : ''}
            </p>
          </div>
          {channelId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing || disabled}
              className="h-8 w-8 p-0"
              title="Sincronizar plantillas"
            >
              <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              approvedTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-colors mb-2',
                    'hover:bg-accent hover:border-primary',
                    selectedTemplate?.id === template.id && 'bg-accent border-primary'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm truncate">{template.name}</h5>
                        {selectedTemplate?.id === template.id && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {getTemplatePreview(template)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {template.category}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {template.language}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>

      {/* Diálogo para parámetros */}
      <Dialog open={showParamsDialog} onOpenChange={setShowParamsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Parámetros de la Plantilla</DialogTitle>
            <DialogDescription>
              Completa los parámetros requeridos para la plantilla "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedTemplatePlaceholders.map((placeholder) => {
              const paramKey = `param_${placeholder.index}`;
              return (
                <div key={paramKey} className="space-y-2">
                  <Label htmlFor={paramKey}>{placeholder.label}</Label>
                  <Input
                    id={paramKey}
                    placeholder={`Ingresa el valor para {{${placeholder.index}}}`}
                    value={templateParams[paramKey] || ''}
                    onChange={(e) =>
                      setTemplateParams({
                        ...templateParams,
                        [paramKey]: e.target.value,
                      })
                    }
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParamsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmParams}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Popover>
  );
}
