import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendEnvPath = path.resolve(__dirname, '../.env');

// Ensure backend/.env loads reliably as the source of truth regardless of process.cwd()
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: true });
} else {
  dotenv.config();
}

export const BACKEND_ENV_PATH = backendEnvPath;
