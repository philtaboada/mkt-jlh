import { Storage } from '@google-cloud/storage';
import path from 'path';

function getStorageConfig() {
  if (process.env.GCP_CREDENTIALS_JSON) {
    try {
      // Remover comillas simples o dobles al inicio y final si existen
      let jsonString = process.env.GCP_CREDENTIALS_JSON.trim();
      if ((jsonString.startsWith("'") && jsonString.endsWith("'")) || 
          (jsonString.startsWith('"') && jsonString.endsWith('"'))) {
        jsonString = jsonString.slice(1, -1);
      }
      
      // Si el JSON parece estar incompleto (no termina con }), puede ser que esté en múltiples líneas
      // En archivos .env, los valores deben estar en una sola línea
      if (!jsonString.endsWith('}') && !jsonString.includes('}')) {
        throw new Error('GCP_CREDENTIALS_JSON parece estar incompleto. Los archivos .env no soportan valores multilínea. Por favor, pon el JSON completo en una sola línea.');
      }
      
      const credentials = JSON.parse(jsonString);
      
      // Validar que tenga los campos mínimos requeridos
      if (!credentials.type || !credentials.project_id || !credentials.private_key || !credentials.client_email) {
        throw new Error('GCP_CREDENTIALS_JSON está incompleto. Faltan campos requeridos (type, project_id, private_key, client_email)');
      }
      
      return { credentials };
    } catch (error) {
      console.error('[GCP] Error parsing GCP_CREDENTIALS_JSON:', error);
      if (error instanceof Error && error.message.includes('incompleto')) {
        throw error;
      }
      throw new Error(`Invalid GCP_CREDENTIALS_JSON format: ${error instanceof Error ? error.message : 'Unknown error'}. Asegúrate de que el JSON esté en una sola línea en el archivo .env`);
    }
  }

  if (process.env.GCP_CREDENTIALS) {
    const keyFile = path.join(process.cwd(), process.env.GCP_CREDENTIALS);
    return { keyFilename: keyFile };
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS };
  }

  return {};
}

let storage: Storage | null = null;
let bucket: ReturnType<Storage['bucket']> | null = null;

function initializeStorage() {
  // Si ya está inicializado, retornar
  if (storage && bucket) {
    return { storage, bucket };
  }

  // Intentar inicializar
  try {
    const config = getStorageConfig();
    storage = new Storage(config);
    
    const bucketName = process.env.GCP_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('GCP_BUCKET_NAME environment variable is required');
    }
    
    bucket = storage.bucket(bucketName);
    return { storage, bucket };
  } catch (error) {
    console.error('[GCP] Error initializing storage:', error);
    // Resetear para permitir reintentos
    storage = null;
    bucket = null;
    throw error;
  }
}

// Intentar inicializar al importar, pero no fallar si hay error
// (permitirá reintentos más tarde)
try {
  initializeStorage();
} catch (error) {
  // Solo loguear el warning, no lanzar error
  // Esto permite que la aplicación arranque incluso si GCP no está configurado
  console.warn('[GCP] Storage initialization failed, will retry on first use:', error instanceof Error ? error.message : error);
}

// Exportar función para obtener storage de forma lazy
export function getStorage() {
  return initializeStorage();
}

export { storage, bucket };
