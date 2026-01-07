'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks/useChannels';
import { toast } from 'sonner';
import type { FacebookConfig } from '@/features/chat/types/settings';

interface FacebookFormProps {
  channelId?: string;
}

export default function FacebookForm({ channelId }: FacebookFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FacebookConfig>>({
    page_id: '',
    page_name: '',
    page_access_token: '',
    verify_token: '',
  });

  const { data: channel } = useChannel(channelId || '');
  const updateChannelMutation = useUpdateChannel();

  useEffect(() => {
    if (channel?.config) {
      setFormData(channel.config as FacebookConfig);
    }
  }, [channel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              toast.success('Configuración de Facebook guardada');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <MessageCircle size={22} className="text-blue-700 dark:text-blue-400" /> Integración
          Facebook Messenger
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Conecta tu página de Facebook para recibir y responder mensajes directamente desde el
          panel.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-blue-200 dark:border-blue-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400">
          Credenciales
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-blue-700 dark:text-blue-400">
              Page Access Token
            </label>
            <Input
              type="password"
              name="page_access_token"
              placeholder="EAA..."
              value={formData.page_access_token || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-blue-700 dark:text-blue-400">
              Token de Verificación
            </label>
            <Input
              type="password"
              name="verify_token"
              placeholder="Tu token de verificación"
              value={formData.verify_token || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-blue-700 dark:text-blue-400">Page ID</label>
            <Input
              type="text"
              name="page_id"
              placeholder="123456789"
              value={formData.page_id || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-blue-700 dark:text-blue-400">
              Nombre de la Página
            </label>
            <Input
              type="text"
              name="page_name"
              placeholder="Mi Página de Facebook"
              value={formData.page_name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </form>
  );
}
