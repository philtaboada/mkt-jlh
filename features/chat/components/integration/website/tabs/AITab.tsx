'use client';

import { useState } from 'react';
import { Sparkles, Brain, MessageSquare, Zap, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WebsiteWidgetConfig, AIConfig } from '@/features/chat/types/settings';
import { aiModels, defaultSystemPrompt, defaultAIConfig, responseModeOptions } from '@/features/chat/constants';
import { validateApiKeyFormat } from '@/lib/utils/encryption';

/**
 * Encripta una API key llamando a la API del servidor
 */
async function encryptApiKeyViaApi(apiKey: string): Promise<string> {
  const response = await fetch('/api/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    throw new Error('Failed to encrypt API key');
  }

  const data = await response.json();
  return data.encrypted;
}

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
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
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
          <AIResponseModeCard widgetConfig={widgetConfig} updateAIConfig={updateAIConfig} />
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

function AIResponseModeCard({ widgetConfig, updateAIConfig }: AICardProps) {
  const currentMode = widgetConfig?.ai_config?.response_mode || 'hybrid';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🎯 Modo de Respuesta
        </CardTitle>
        <CardDescription>
          Define quién responderá a los mensajes de los clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {responseModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateAIConfig({ response_mode: option.value })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                currentMode === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
                {currentMode === option.value && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AIProviderCard({ widgetConfig, updateAIConfig }: AICardProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentProvider = widgetConfig?.ai_config?.provider || 'openai';
  const hasApiKey = Boolean(widgetConfig?.ai_config?.api_key_encrypted);

  const handleApiKeyChange = (value: string) => {
    setApiKeyInput(value);
    if (value.trim()) {
      setIsValidKey(validateApiKeyFormat(value, currentProvider));
    } else {
      setIsValidKey(null);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim() || !isValidKey) return;

    setIsSaving(true);
    try {
      const encrypted = await encryptApiKeyViaApi(apiKeyInput);
      updateAIConfig({ api_key_encrypted: encrypted });
      setApiKeyInput('');
      setIsValidKey(null);
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveApiKey = () => {
    updateAIConfig({ api_key_encrypted: '' });
  };

  const getApiKeyPlaceholder = () => {
    switch (currentProvider) {
      case 'openai':
        return 'sk-...';
      case 'anthropic':
        return 'sk-ant-...';
      case 'google':
        return 'AIza...';
      default:
        return 'Ingresa tu API key';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Proveedor y Modelo
        </CardTitle>
        <CardDescription>Selecciona el proveedor de IA y configura tu API key</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Select
              value={currentProvider}
              onValueChange={(value: 'openai' | 'anthropic' | 'google') => {
                const firstModel = aiModels[value][0].value;
                updateAIConfig({ provider: value, model: firstModel, api_key_encrypted: '' });
                setApiKeyInput('');
                setIsValidKey(null);
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
                {aiModels[currentProvider].map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* API Key Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <Label>API Key de {currentProvider === 'openai' ? 'OpenAI' : currentProvider === 'anthropic' ? 'Anthropic' : 'Google'}</Label>
          </div>

          {hasApiKey ? (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  ✓ API Key configurada
                </p>
                <p className="text-xs text-muted-foreground">
                  La key está encriptada de forma segura
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveApiKey}>
                Cambiar
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder={getApiKeyPlaceholder()}
                    value={apiKeyInput}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className={isValidKey === false ? 'border-red-500' : isValidKey === true ? 'border-green-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button 
                  onClick={handleSaveApiKey} 
                  disabled={!isValidKey || isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
              {isValidKey === false && (
                <p className="text-xs text-red-500">
                  El formato de la API key no parece válido para {currentProvider}
                </p>
              )}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Tu API key se encriptará antes de guardarse. Nunca se almacena en texto plano.
                </AlertDescription>
              </Alert>
            </div>
          )}
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
