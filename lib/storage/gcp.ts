import { Storage } from '@google-cloud/storage';
import path from 'path';

function getStorageConfig() {
  if (process.env.GCP_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
      return { credentials };
    } catch {
      throw new Error('Invalid GCP_CREDENTIALS_JSON format');
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

let storage: Storage;
let bucket: ReturnType<Storage['bucket']>;

try {
  const config = getStorageConfig();
  storage = new Storage(config);
  
  const bucketName = process.env.GCP_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('GCP_BUCKET_NAME environment variable is required');
  }
  
  bucket = storage.bucket(bucketName);
} catch (error) {
  throw error;
}

export { storage, bucket };
