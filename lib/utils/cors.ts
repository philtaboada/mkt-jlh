import { NextRequest } from 'next/server';

/**
 * Genera headers CORS dinámicamente basados en el origen de la petición
 * Permite cualquier origen HTTP/HTTPS válido para el widget
 */
export function getCorsHeaders(request: NextRequest, methods: string = 'GET, POST, OPTIONS') {
  const origin = request.headers.get('origin');
  
  // Si hay un origen válido, usarlo; si no, permitir todos (para desarrollo)
  const allowOrigin = origin || '*';
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}
