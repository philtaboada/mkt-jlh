'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';

import { syncWhatsappTemplates, useTemplates } from '@/features/chat/hooks';
import { MessageTemplate } from '@/features/chat/types/template';
import { extractPlaceholders, getTemplatePreview } from '@/features/chat/utils/templateUtils';

interface TemplateSelectorProps {
  onSelect: (template: MessageTemplate, params?: Record<string, string>) => void;
  disabled?: boolean;
  channelId: string;
  onSyncComplete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TemplateSelector({
  onSelect,
  disabled = false,
  channelId,
  onSyncComplete,
  open,
  onOpenChange,
}: TemplateSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setCurrentOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showParamsDialog, setShowParamsDialog] = useState(false);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});

  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplates(
    channelId,
    'whatsapp'
  );
  const templates = templatesData || [];

  const syncMutation = syncWhatsappTemplates(channelId);

  const handleSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);

    setTemplateParams({});
    setShowParamsDialog(true);
    setCurrentOpen(false);
  };

  const handleConfirmParams = () => {
    if (!selectedTemplate) return;
    onSelect(selectedTemplate, templateParams);
    setShowParamsDialog(false);
    setTemplateParams({});
  };

  const selectedTemplatePlaceholders = useMemo(() => {
    if (!selectedTemplate) return [];
    return extractPlaceholders(selectedTemplate);
  }, [selectedTemplate]);

  // if (templates.length === 0) {
  //   return null;
  // }

  return (
    <Popover open={currentOpen} onOpenChange={setCurrentOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoadingTemplates}
          className={cn('gap-2', isControlled && 'invisible absolute')}
        >
          <FileText className="w-4 h-4" />
          Plantillas
          {selectedTemplate && (
            <span className="ml-1 text-xs text-muted-foreground">({selectedTemplate.name})</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">Seleccionar Plantilla</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {templates.length} plantilla{templates.length !== 1 ? 's' : ''} disponible
              {templates.length !== 1 ? 's' : ''}
            </p>
          </div>
          {channelId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => syncMutation.mutate(channelId)}
              disabled={syncMutation.isPending || disabled}
              className="h-8 w-8 p-0"
              title="Sincronizar plantillas"
            >
              <RefreshCw className={cn('h-4 w-4', syncMutation.isPending && 'animate-spin')} />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No hay plantillas disponibles
              </div>
            ) : (
              templates.map((template) => (
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
                        <span className="text-xs text-muted-foreground">{template.category}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{template.language}</span>
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
            {/* Preview del mensaje con parámetros reemplazados y mejor UI */}
            {selectedTemplate && (
              <div className="mt-6 p-4 border rounded bg-muted space-y-2">
                <Label className="mb-2 block text-base font-semibold text-primary">
                  Preview del mensaje
                </Label>
                {['HEADER', 'BODY', 'FOOTER'].map((section) => {
                  const comp = selectedTemplate.components.find((c) => c.type === section);
                  if (!comp?.text) return null;
                  let preview = comp.text;
                  selectedTemplatePlaceholders.forEach((p) => {
                    if (p.component === section) {
                      const value = templateParams[`param_${p.index}`] || `{{${p.index}}}`;
                      preview = preview.replace(new RegExp(`\\{\\{${p.index}\\}\\}`, 'g'), value);
                    }
                  });
                  return (
                    <div
                      key={section}
                      className={
                        section === 'HEADER'
                          ? 'text-sm font-bold text-primary'
                          : section === 'BODY'
                            ? 'text-sm text-foreground'
                            : 'text-xs text-muted-foreground italic'
                      }
                    >
                      {section === 'HEADER' && (
                        <span className="block mb-1 text-xs text-muted-foreground">Encabezado</span>
                      )}
                      {section === 'BODY' && (
                        <span className="block mb-1 text-xs text-muted-foreground">Cuerpo</span>
                      )}
                      {section === 'FOOTER' && (
                        <span className="block mb-1 text-xs text-muted-foreground">Pie</span>
                      )}
                      <span className="whitespace-pre-line">{preview}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParamsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmParams}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Popover>
  );
}
