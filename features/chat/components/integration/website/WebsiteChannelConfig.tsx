'use client';

import { useState, useEffect } from 'react';
import { Code2, Palette, Settings2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChannel, useUpdateChannel, useRegenerateWidgetToken } from '@/features/chat/hooks';
import {
  generateWidgetScript,
  type WebsiteWidgetConfig,
  type AIConfig,
} from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { ChannelHeader } from './components';
import { ScriptTab, AppearanceTab, BehaviorTab, AITab } from './tabs';

type TabType = 'script' | 'appearance' | 'behavior' | 'ai';

interface WebsiteChannelConfigProps {
  channelId: string;
}

// Tab configuration
const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'script', label: 'Código', icon: <Code2 className="w-4 h-4" /> },
  { id: 'appearance', label: 'Apariencia', icon: <Palette className="w-4 h-4" /> },
  { id: 'behavior', label: 'Comportamiento', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'ai', label: 'Inteligencia Artificial', icon: <Bot className="w-4 h-4" /> },
];

export function WebsiteChannelConfig({ channelId }: WebsiteChannelConfigProps) {
  const { data: channel, isLoading } = useChannel(channelId);
  const updateChannelMutation = useUpdateChannel();
  const regenerateTokenMutation = useRegenerateWidgetToken();

  const [activeTab, setActiveTab] = useState<TabType>('script');
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<Partial<WebsiteWidgetConfig>>({});

  useEffect(() => {
    if (channel?.config) {
      setConfig(channel.config as WebsiteWidgetConfig);
    }
  }, [channel]);

  const widgetConfig = config as WebsiteWidgetConfig;

  // Regenerar script cuando cambie la URL del sitio web
  useEffect(() => {
    // Forzar re-render del script cuando cambie website_url
    if (widgetConfig?.website_url) {
      // El script se regenera automáticamente porque baseUrl depende de widgetConfig.website_url
    }
  }, [widgetConfig?.website_url]);

  const baseUrl =
    widgetConfig?.website_url ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com');

  const scriptCode = widgetConfig?.widget_token
    ? generateWidgetScript({
        token: widgetConfig.widget_token,
        baseUrl,
      })
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handleRegenerateToken = () => {
    if (confirm('¿Estás seguro? El código anterior dejará de funcionar.')) {
      regenerateTokenMutation.mutate(channelId);
    }
  };

  const handleSaveConfig = () => {
    updateChannelMutation.mutate({
      id: channelId,
      input: { config },
    });
  };

  const updateConfig = (key: keyof WebsiteWidgetConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateAIConfig = (updates: Partial<AIConfig>) => {
    updateConfig('ai_config', {
      ...widgetConfig?.ai_config,
      ...updates,
    });
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
      <ChannelHeader channel={channel} />

      {/* Tabs */}
      <div className="bg-card border-b border-border px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {activeTab === 'script' && (
            <ScriptTab
              widgetConfig={widgetConfig}
              scriptCode={scriptCode}
              copied={copied}
              onCopy={handleCopy}
              onRegenerateToken={handleRegenerateToken}
              isRegenerating={regenerateTokenMutation.isPending}
              updateConfig={updateConfig}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceTab widgetConfig={widgetConfig} updateConfig={updateConfig} />
          )}

          {activeTab === 'behavior' && (
            <BehaviorTab widgetConfig={widgetConfig} updateConfig={updateConfig} />
          )}

          {activeTab === 'ai' && (
            <AITab
              widgetConfig={widgetConfig}
              updateConfig={updateConfig}
              updateAIConfig={updateAIConfig}
            />
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveConfig} disabled={updateChannelMutation.isPending}>
              {updateChannelMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
