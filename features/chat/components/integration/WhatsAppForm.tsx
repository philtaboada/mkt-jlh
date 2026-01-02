'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChannel, useUpdateChannel } from '@/features/chat/hooks/useChannels';
import { toast } from 'sonner';
import type { WhatsAppConfig } from '@/features/chat/types/settings';

interface WhatsAppFormProps {
  channelId?: string;
}

export default function WhatsAppForm({ channelId }: WhatsAppFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<WhatsAppConfig>>({
    phone_number_id: '',
    phone_number: '',
    business_account_id: '',
    access_token: '',
    verify_token: '',
    webhook_verified: false,
  });

  const { data: channel } = useChannel(channelId || '');
  const updateChannelMutation = useUpdateChannel();

  useEffect(() => {
    if (channel?.config) {
      setFormData(channel.config as WhatsAppConfig);
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
              toast.success('Configuración de WhatsApp guardada');
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
        <h1 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
          <Smartphone size={22} className="text-green-700 dark:text-green-400" /> Integración
          WhatsApp
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Configura tu WhatsApp Business API para enviar y recibir mensajes.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-green-200 dark:border-green-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-400">
          Credenciales
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">
              Token de Acceso
            </label>
            <Input
              type="password"
              name="access_token"
              placeholder="EAA..."
              value={formData.access_token || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">
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
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">
              Phone Number ID
            </label>
            <Input
              type="text"
              name="phone_number_id"
              placeholder="123456789"
              value={formData.phone_number_id || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">
              Número telefónico
            </label>
            <Input
              type="text"
              name="phone_number"
              placeholder="+1234567890"
              value={formData.phone_number || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">
              Business Account ID
            </label>
            <Input
              type="text"
              name="business_account_id"
              placeholder="123456789"
              value={formData.business_account_id || ''}
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
