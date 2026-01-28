'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks/useChannels';
import { toast } from 'sonner';
import type { InstagramConfig } from '@/features/chat/types/settings';

interface InstagramFormProps {
  channelId?: string;
  embedded?: boolean;
  value?: Partial<InstagramConfig>;
  onChange?: (partial: Partial<InstagramConfig>) => void;
}

export default function InstagramForm({
  channelId,
  embedded = false,
  value,
  onChange,
}: InstagramFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<InstagramConfig>>({
    account_id: '',
    username: '',
    access_token: '',
    verify_token: '',
  });

  const { data: channel } = useChannel(channelId || '');
  const updateChannelMutation = useUpdateChannel();

  useEffect(() => {
    if (channel?.config && !value) {
      setFormData(channel.config as InstagramConfig);
    }
  }, [channel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (onChange) {
      onChange({ [name]: value } as Partial<InstagramConfig>);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (embedded) return;
    setLoading(true);
    try {
      if (channelId) {
        updateChannelMutation.mutate(
          {
            id: channelId,
            input: { config: formData },
          },
          {
            onSuccess: () => {
              toast.success('Configuración de Instagram guardada');
            },
            onError: () => {
              toast.error('Error al guardar configuración');
            },
          }
        );
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const current = value ?? formData;

  const inputs = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1 ">Business Account ID</label>
        <Input
          type="text"
          name="account_id"
          placeholder="123456789"
          value={current.account_id || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1 ">Token de Verificación</label>
        <Input
          type="password"
          name="verify_token"
          placeholder="Tu token de verificación"
          value={current.verify_token || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm mb-1 ">Usuario de Instagram</label>
        <Input
          type="text"
          name="username"
          placeholder="@miusuario"
          value={current.username || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1 ">Access Token</label>
        <Input
          type="password"
          name="access_token"
          placeholder="EAA..."
          value={current.access_token || ''}
          onChange={handleChange}
          required
        />
      </div>
      {!embedded && (
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      )}
    </div>
  );

  if (embedded) {
    return <>{inputs}</>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold  flex items-center gap-2">
          <Instagram size={22} className="" /> Integración Instagram DM
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Conecta tu cuenta de Instagram Business para gestionar mensajes directos desde el panel.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-pink-200 dark:border-pink-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 ">Credenciales</h2>
        {inputs}
      </div>
    </form>
  );
}
