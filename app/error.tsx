'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type Props = {
  error: Error;
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {}, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error?.message || 'Se produjo un error inesperado.'}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reintentar
          </button>

          <Link href="/" className="px-4 py-2 border rounded-md">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
