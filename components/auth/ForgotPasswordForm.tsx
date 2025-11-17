'use client';

import * as React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { translateAuthError } from '@/lib/utils/authErrors';

export function ForgotPasswordForm() {
  const { forgotPassword, isForgotPasswordLoading, forgotPasswordError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    try {
      forgotPassword?.({ email });
      setSuccess(
        'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.'
      );
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo más tarde.');
    }
  };

  return (
    <div className="w-full flex flex-col items-start md:items-center justify-center py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-200">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300 ">
            Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || forgotPasswordError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error ||
                translateAuthError((forgotPasswordError as any)?.message) ||
                'Ocurrió un error. Intenta de nuevo más tarde.'}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={isForgotPasswordLoading} className="w-full">
              {isForgotPasswordLoading ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
