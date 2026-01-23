/**
 * Convierte una fecha UTC a hora local del usuario
 * @param date - Fecha como string ISO, Date, o undefined
 * @returns Date en hora local
 */
export function parseToLocalDate(date: string | Date | undefined | null): Date | null {
  if (!date) return null;
  
  if (date instanceof Date) {
    return date;
  }
  
  if (typeof date === 'string') {
    const dateStr = date.trim();
    
    // Si ya tiene zona horaria (Z, +, -), usar directamente
    if (dateStr.includes('Z') || dateStr.includes('+') || dateStr.match(/-\d{2}:\d{2}$/)) {
      return new Date(dateStr);
    }
    
    // Si no tiene zona horaria, asumir que es UTC y agregar Z
    return new Date(dateStr + 'Z');
  }
  
  return new Date(date);
}

/**
 * Formatea una fecha a hora local en formato HH:MM
 * @param date - Fecha como string ISO, Date, o undefined
 * @param locale - Locale para formatear (default: 'es-ES')
 * @returns String con la hora formateada o '--:--' si no hay fecha
 */
export function formatLocalTime(
  date: string | Date | undefined | null,
  locale: string = 'es-ES'
): string {
  const localDate = parseToLocalDate(date);
  
  if (!localDate || isNaN(localDate.getTime())) {
    return '--:--';
  }
  
  // toLocaleTimeString automáticamente convierte a la zona horaria local del navegador
  return localDate.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea una fecha a fecha y hora local
 * @param date - Fecha como string ISO, Date, o undefined
 * @param locale - Locale para formatear (default: 'es-ES')
 * @returns String con la fecha y hora formateada
 */
export function formatLocalDateTime(
  date: string | Date | undefined | null,
  locale: string = 'es-ES'
): string {
  const localDate = parseToLocalDate(date);
  
  if (!localDate || isNaN(localDate.getTime())) {
    return '--/--/----, --:--';
  }
  
  return localDate.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const convertUTCToLocal = (dateString?: string): string => {
  if (!dateString) {
    const date = new Date();
    const originalDay = date.getDate();
    date.setHours(date.getHours() + 5);
    if (date.getDate() !== originalDay) {
      date.setHours(23, 59, 59, 999);
    }
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  const date = new Date(dateString);
  if (!dateString.includes('T')) {
    const now = new Date();
    const combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
    combined.setHours(combined.getHours() + 5);
    if (combined.getDate() !== date.getDate()) {
      combined.setHours(23, 59, 59, 999);
    }
    const localDate = new Date(combined.getTime() - combined.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (dateString.includes('Z') || dateString.includes('+00:00') || dateString.includes('-00:00')) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  date.setHours(date.getHours() + 5);
  const originalDate = new Date(dateString);
  if (date.getDate() !== originalDate.getDate()) {
    date.setHours(23, 59, 59, 999);
  }
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 19).replace('T', ' ');
};
