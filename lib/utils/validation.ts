/**
 * Valida si un RUC es válido (básica)
 */
export function isValidRuc(ruc: string): boolean {
  // Validación básica de RUC peruano (11 dígitos)
  const rucRegex = /^[0-9]{11}$/;
  return rucRegex.test(ruc);
}

/**
 * Valida si un DNI es válido (básica)
 */
export function isValidDni(dni: string): boolean {
  // Validación básica de DNI peruano (8 dígitos)
  const dniRegex = /^[0-9]{8}$/;
  return dniRegex.test(dni);
}
