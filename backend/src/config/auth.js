import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  console.error("[Auth] Error: JWT_SECRET is not set in .env file.");
  process.exit(1);
}

export const jwtSecret = JWT_SECRET;
