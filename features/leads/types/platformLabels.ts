// Mapeo de plataformas y función para obtener la etiqueta legible
export const PlatformLabels: Record<string, string> = {
  fb: 'Facebook',
  ig: 'Instagram',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  web: 'Sitio Web',
  other: 'Otro',
};

export function getPlatformLabel(platform: string): string {
  return PlatformLabels[platform] || platform;
}
