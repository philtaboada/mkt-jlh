'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Link2, ArrowRight } from 'lucide-react';

interface NoContactMessageProps {
  onCreateNew: () => void;
  onLinkExisting: () => void;
  isLoading?: boolean;
  source?: string;
}

export function NoContactMessage({
  onCreateNew,
  onLinkExisting,
  isLoading = false,
  source = 'web',
}: NoContactMessageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Sin contacto relacionado</h3>
        <p className="text-sm text-muted-foreground">
          Esta conversación no tiene un contacto vinculado. Puedes crear uno nuevo o vincularlo a un
          contacto existente.
        </p>
      </div>

      <Separator className="w-full" />

      <div className="w-full max-w-sm space-y-4">
        {/* Create New Contact */}
        <Card className="bg-card border border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Crear nuevo contacto
            </CardTitle>
            <CardDescription>
              Los campos se pre-rellenarán con la información de la conversación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onCreateNew}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Creando...' : 'Crear contacto'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Link Existing Contact */}
        <Card className="bg-card border border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              Vincular contacto existente
            </CardTitle>
            <CardDescription>
              Busca y vincula un contacto que ya existe en tu base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={onLinkExisting}
              disabled={isLoading}
              className="w-full"
            >
              Buscar contacto
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
