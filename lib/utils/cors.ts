import { NextRequest } from 'next/server';

export function getCorsHeaders(request: NextRequest, methods: string = 'GET, POST, OPTIONS') {
  const origin = request.headers.get('origin');

  const allowOrigin = '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}
