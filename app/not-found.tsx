import Link from 'next/link';
import Image from 'next/image';
import { Home, Grid } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-sm">
            <Image
              src="/404.webp"
              alt="404 illustration"
              width={560}
              height={360}
              className="mx-auto"
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground mb-4">
          La página que buscas no existe o fue movida. Puede que la URL esté mal escrita o que el
          recurso ya no esté disponible.
        </p>

        <p className="text-sm text-muted-foreground mb-6">Prueba una de estas opciones:</p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            <Home className="size-4" /> Volver al inicio
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md"
          >
            <Grid className="size-4" /> Ir al dashboard
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Si crees que esto es un error, contáctanos en{' '}
          <a href="mailto:soporte@example.com" className="underline">
            soporte@example.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
