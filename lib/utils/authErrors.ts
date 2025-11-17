export function translateAuthError(message?: string) {
  if (!message) return undefined;
  const msg = String(message).toLowerCase();

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password') ||
    msg.includes('invalid sign in')
  ) {
    return 'Correo o contraseña incorrectos.';
  }
  if (msg.includes('user not found') || msg.includes('no user')) {
    return 'No se encontró una cuenta con ese correo.';
  }
  if (msg.includes('password')) {
    return 'Error con la contraseña. Verifica e intenta de nuevo.';
  }
  if (msg.includes('email')) {
    return 'Error con el correo electrónico.';
  }
  return message;
}
