'use client';

import { Sparkles, Brain, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WebsiteWidgetConfig, AIConfig } from '@/features/chat/types/settings';
import { aiModels, defaultSystemPrompt, defaultAIConfig } from '@/features/chat/constants';

interface AITabProps {
  widgetConfig: WebsiteWidgetConfig;
  updateConfig: (key: keyof WebsiteWidgetConfig, value: unknown) => void;
  updateAIConfig: (updates: Partial<AIConfig>) => void;
}

export function AITab({ widgetConfig, updateConfig, updateAIConfig }: AITabProps) {
  const handleEnableAI = (checked: boolean) => {
    updateConfig('ai_enabled', checked);
    if (checked && !widgetConfig?.ai_config) {
      updateConfig('ai_config', defaultAIConfig);
    }
  };

  return (
    <>
      {/* AI Enable Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Respuestas con IA</CardTitle>
                <CardDescription>
                  Habilita respuestas automáticas usando inteligencia artificial
                </CardDescription>
              </div>
            </div>
            <Switch checked={widgetConfig?.ai_enabled ?? false} onCheckedChange={handleEnableAI} />
          </div>
        </CardHeader>
      </Card>

      {widgetConfig?.ai_enabled && (
        <>
          <AIProviderCard widgetConfig={widgetConfig} updateAIConfig={updateAIConfig} />
          <AISystemPromptCard widgetConfig={widgetConfig} updateAIConfig={updateAIConfig} />
          <AIAutoReplyCard widgetConfig={widgetConfig} updateAIConfig={updateAIConfig} />
          <AIKnowledgeBaseCard widgetConfig={widgetConfig} updateAIConfig={updateAIConfig} />
        </>
      )}
    </>
  );
}

// ============================================================================
// AI Sub-components
// ============================================================================

interface AICardProps {
  widgetConfig: WebsiteWidgetConfig;
  updateAIConfig: (updates: Partial<AIConfig>) => void;
}

function AIProviderCard({ widgetConfig, updateAIConfig }: AICardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Proveedor y Modelo
        </CardTitle>
        <CardDescription>Selecciona el proveedor de IA y el modelo a utilizar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Select
              value={widgetConfig?.ai_config?.provider || 'openai'}
              onValueChange={(value: 'openai' | 'anthropic' | 'google') => {
                const firstModel = aiModels[value][0].value;
                updateAIConfig({ provider: value, model: firstModel });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="google">Google (Gemini)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select
              value={widgetConfig?.ai_config?.model || 'gpt-4o-mini'}
              onValueChange={(value) => updateAIConfig({ model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiModels[widgetConfig?.ai_config?.provider || 'openai'].map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Temperatura: {widgetConfig?.ai_config?.temperature || 0.7}</Label>
            <p className="text-xs text-muted-foreground">
              Menor = más preciso, Mayor = más creativo
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={widgetConfig?.ai_config?.temperature || 0.7}
              onChange={(e) => updateAIConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Máximo de tokens</Label>
            <Input
              type="number"
              value={widgetConfig?.ai_config?.max_tokens || 500}
              onChange={(e) => updateAIConfig({ max_tokens: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AISystemPromptCard({ widgetConfig, updateAIConfig }: AICardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Prompt del Sistema
        </CardTitle>
        <CardDescription>
          Define las instrucciones y personalidad del asistente de IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Eres un asistente de atención al cliente..."
          className="min-h-[200px] font-mono text-sm"
          value={widgetConfig?.ai_config?.system_prompt || defaultSystemPrompt}
          onChange={(e) => updateAIConfig({ system_prompt: e.target.value })}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateAIConfig({ system_prompt: defaultSystemPrompt })}
        >
          Restaurar prompt por defecto
        </Button>
      </CardContent>
    </Card>
  );
}

function AIAutoReplyCard({ widgetConfig, updateAIConfig }: AICardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Respuesta Automática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Responder automáticamente</Label>
            <p className="text-xs text-muted-foreground">
              La IA responderá sin intervención humana
            </p>
          </div>
          <Switch
            checked={widgetConfig?.ai_config?.auto_reply ?? true}
            onCheckedChange={(checked) => updateAIConfig({ auto_reply: checked })}
          />
        </div>

        {widgetConfig?.ai_config?.auto_reply && (
          <div className="space-y-2">
            <Label>Retraso antes de responder (segundos)</Label>
            <Input
              type="number"
              min="0"
              max="30"
              value={widgetConfig?.ai_config?.auto_reply_delay || 3}
              onChange={(e) => updateAIConfig({ auto_reply_delay: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Un pequeño retraso hace que la respuesta se sienta más natural
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <Label>Palabras clave para transferir a humano</Label>
          <Textarea
            placeholder="agente, humano, persona..."
            value={widgetConfig?.ai_config?.handoff_keywords?.join(', ') || ''}
            onChange={(e) =>
              updateAIConfig({
                handoff_keywords: e.target.value
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Separadas por coma. Si el usuario menciona estas palabras, se transferirá a un agente
          </p>
        </div>

        <div className="space-y-2">
          <Label>Mensaje de fallback</Label>
          <Input
            placeholder="Lo siento, no pude procesar tu mensaje..."
            value={widgetConfig?.ai_config?.fallback_message || ''}
            onChange={(e) => updateAIConfig({ fallback_message: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Mensaje a mostrar si la IA no puede responder
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AIKnowledgeBaseCard({ widgetConfig, updateAIConfig }: AICardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Base de Conocimientos</CardTitle>
            <CardDescription>
              URLs que la IA puede consultar para responder preguntas
            </CardDescription>
          </div>
          <Switch
            checked={widgetConfig?.ai_config?.knowledge_base_enabled ?? false}
            onCheckedChange={(checked) => updateAIConfig({ knowledge_base_enabled: checked })}
          />
        </div>
      </CardHeader>
      {widgetConfig?.ai_config?.knowledge_base_enabled && (
        <CardContent>
          <Textarea
            placeholder="https://tu-sitio.com/faq&#10;https://tu-sitio.com/docs"
            className="min-h-[100px]"
            value={widgetConfig?.ai_config?.knowledge_base_urls?.join('\n') || ''}
            onChange={(e) =>
              updateAIConfig({
                knowledge_base_urls: e.target.value
                  .split('\n')
                  .map((u) => u.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="text-xs text-muted-foreground mt-2">
            Una URL por línea. La IA usará este contenido como contexto para responder.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
