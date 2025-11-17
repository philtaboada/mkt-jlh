'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResendSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('resend_api_key') : null;
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('resend_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('resend_api_key');
    setApiKey('');
  };

  const copyEnvSnippet = async () => {
    const snippet = `RESEND_API_KEY=${apiKey || 're_...YOUR_KEY...'}`;
    await navigator.clipboard.writeText(snippet);
    alert('Snippet copiado al portapapeles. Pega en tu .env.local');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resend Settings</h1>

      <div className="max-w-xl bg-white rounded-md p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2">Resend API Key</label>
        <div className="flex gap-2">
          <Input
            value={apiKey}
            onChange={(e: any) => setApiKey(e.target.value)}
            placeholder="re_..."
          />
          <Button onClick={handleSave}>Save</Button>
          <Button variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Nota: por seguridad, la forma recomendada es configurar <code>RESEND_API_KEY</code> en
            variables de entorno del servidor (ej. <code>.env.local</code>), no en el cliente. Aquí
            puedes guardar temporalmente la clave en tu navegador para pruebas locales.
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={copyEnvSnippet}>Copiar snippet .env</Button>
          </div>
          {saved && <div className="text-sm text-green-600 mt-2">Guardado en localStorage</div>}
        </div>
      </div>
    </div>
  );
}
