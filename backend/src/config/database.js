import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error("[DB] Error: Database credentials (DB_NAME, DB_USER, DB_PASSWORD) are not set in .env file.");
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: console.log,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] MySQL Connection has been established successfully.');
  } catch (error) {
    console.error('[DB] Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
