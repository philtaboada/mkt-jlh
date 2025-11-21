import { Storage } from '@google-cloud/storage';
import path from 'path';

const keyFile = path.join(process.cwd(), process.env.GCP_CREDENTIALS!);

export const storage = new Storage({
  keyFilename: keyFile,
});

export const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);
