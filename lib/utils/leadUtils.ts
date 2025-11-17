import { LeadProductTypeEnum } from '@/lib/enums/leadEnums';

export function formatCurrency(amount: number | null): string {
  if (!amount) return '$0';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export const statusColors: Record<string, string> = {
  new: 'bg-linear-to-r from-orange-500 to-yellow-500 text-white shadow-sm',
  contacted: 'bg-linear-to-r from-yellow-400 to-amber-500 text-white shadow-sm',
  qualified: 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-sm',
  proposal: 'bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-sm',
  negotiation: 'bg-linear-to-r from-pink-500 to-rose-600 text-white shadow-sm',
  deals: 'bg-linear-to-r from-cyan-500 to-teal-600 text-white shadow-sm',
  closed_won: 'bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-sm',
  closed_lost: 'bg-linear-to-r from-red-500 to-pink-600 text-white shadow-sm',
};

export const sourceColors: Record<string, string> = {
  website: 'bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-sm',
  social_media: 'bg-linear-to-r from-pink-500 to-rose-600 text-white shadow-sm',
  referral: 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-sm',
  cold_call: 'bg-linear-to-r from-orange-500 to-amber-600 text-white shadow-sm',
  email_campaign: 'bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-sm',
  event: 'bg-linear-to-r from-yellow-500 to-orange-600 text-white shadow-sm',
  other: 'bg-linear-to-r from-slate-500 to-gray-600 text-white shadow-sm',
};

export const platformColors: Record<string, string> = {
  fb: 'bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-sm',
  ig: 'bg-linear-to-r from-pink-600 to-rose-700 text-white shadow-sm',
  whatsapp: 'bg-linear-to-r from-green-600 to-emerald-700 text-white shadow-sm',
  linkedin: 'bg-linear-to-r from-purple-700 to-violet-800 text-white shadow-sm',
  twitter: 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-sm',
  youtube: 'bg-linear-to-r from-red-600 to-pink-700 text-white shadow-sm',
  tiktok: 'bg-linear-to-r from-orange-600 to-yellow-700 text-white shadow-sm',
  other: 'bg-linear-to-r from-gray-500 to-slate-600 text-white shadow-sm',
};

export const productColors: Record<string, string> = {
  [LeadProductTypeEnum.SEGUROS]: 'bg-linear-to-r from-blue-500 to-cyan-600 text-white dark:from-blue-600 dark:to-cyan-700 shadow-sm',
  [LeadProductTypeEnum.ISOS]: 'bg-linear-to-r from-green-500 to-emerald-600 text-white dark:from-green-600 dark:to-emerald-700 shadow-sm',
  [LeadProductTypeEnum.FIDEICOMISOS]: 'bg-linear-to-r from-red-500 to-pink-600 text-white dark:from-red-600 dark:to-pink-700 shadow-sm',
  [LeadProductTypeEnum.CARTA_FIANZA]: 'bg-linear-to-r from-purple-500 to-violet-600 text-white dark:from-purple-600 dark:to-violet-700 shadow-sm',
};
