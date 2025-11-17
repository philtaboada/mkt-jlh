'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/hooks/useAuth';
import { translateAuthError } from '@/lib/utils/authErrors';
import { Label } from '@radix-ui/react-label';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login, isLoginLoading, loginError } = useAuth();
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Correo y contraseña son requeridos');
      return;
    }

    try {
      // useAuth.login espera un objeto { email, password }
      login?.({ email: formData.email, password: formData.password });
    } catch (err) {
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="w-full flex flex-col items-start md:items-center justify-center py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-200">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:underline hover:text-primary-700"
            >
              crear una cuenta nueva
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || loginError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error ||
                translateAuthError((loginError as any)?.message) ||
                'Error al iniciar sesión'}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox id="remember-me" name="remember-me" />
              <Label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
              >
                Recuérdame
              </Label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:underline hover:text-primary-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoginLoading}>
              {isLoginLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
