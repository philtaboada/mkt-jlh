

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32ch';


function getKeyBuffer(): Buffer {
  const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
  return Buffer.from(key, 'utf-8');
}

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

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey || encryptedKey.trim() === '') {
    return '';
  }

  try {
    const parts = encryptedKey.split(':');
    
    if (parts.length === 2) {
      throw new Error('Old encryption format not supported. Please re-save the API key.');
    }
    
    if (parts.length !== 3) {
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
    throw new Error('Failed to decrypt API key');
  }
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••';
  }
  const start = apiKey.slice(0, 7);
  const end = apiKey.slice(-4);
  return `${start}...${end}`;
}


export function validateApiKeyFormat(apiKey: string, provider: 'openai' | 'anthropic' | 'google'): boolean {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    case 'google':
      return apiKey.length > 20;
    default:
      return apiKey.length > 10;
  }
}
