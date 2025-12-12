/**
 * Utilidades para encriptar y desencriptar datos sensibles como API keys
 * Usa AES-256-GCM para encriptación simétrica
 * Compatible con Node.js (servidor) y Web Crypto API (cliente)
 */

import crypto from 'crypto';

// La clave de encriptación debe estar en las variables de entorno
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32ch';

// Asegurar que la clave tenga 32 bytes (256 bits)
function getKeyBuffer(): Buffer {
  const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
  return Buffer.from(key, 'utf-8');
}

/**
 * Encripta una API key usando AES-256-GCM
 * @param apiKey - La API key en texto plano
 * @returns La API key encriptada en formato: iv:authTag:encrypted (hex)
 */
export function encryptApiKey(apiKey: string): string {
  if (!apiKey || apiKey.trim() === '') {
    return '';
  }

  try {
    const key = getKeyBuffer();
    const iv = crypto.randomBytes(12); // 12 bytes para GCM
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    // Formato: iv:authTag:encrypted (todo en hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Desencripta una API key
 * @param encryptedKey - La API key encriptada en formato: iv:authTag:encrypted (hex)
 * @returns La API key en texto plano
 */
export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey || encryptedKey.trim() === '') {
    return '';
  }

  try {
    const parts = encryptedKey.split(':');
    
    // Soportar formato antiguo (2 partes) y nuevo (3 partes)
    if (parts.length === 2) {
      // Formato antiguo sin authTag - no soportado, necesita re-encriptar
      console.warn('Old encryption format detected. Please re-save the API key.');
      throw new Error('Old encryption format not supported. Please re-save the API key.');
    }
    
    if (parts.length !== 3) {
      console.error('Invalid encrypted key format, expected 3 parts, got:', parts.length);
      throw new Error('Invalid encrypted key format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    
    const key = getKeyBuffer();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error decrypting API key:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Enmascara una API key para mostrarla de forma segura
 * Ejemplo: sk-abc...xyz
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••';
  }
  const start = apiKey.slice(0, 7);
  const end = apiKey.slice(-4);
  return `${start}...${end}`;
}

/**
 * Valida el formato de una API key según el proveedor
 */
export function validateApiKeyFormat(apiKey: string, provider: 'openai' | 'anthropic' | 'google'): boolean {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  switch (provider) {
    case 'openai':
      // OpenAI keys empiezan con "sk-" y tienen ~51 caracteres
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'anthropic':
      // Anthropic keys empiezan con "sk-ant-"
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    case 'google':
      // Google API keys son alfanuméricas de ~39 caracteres
      return apiKey.length > 20;
    default:
      return apiKey.length > 10;
  }
}
