import app from './src/app.js';
import { connectDB, sequelize } from './src/config/database.js';
import { initializeDynamicModels } from './src/services/dynamicService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('[Server] Database connection verified.');

    await sequelize.sync();
    console.log('[Server] All static models were synchronized successfully.');

    // Initialize all DYNAMIC models from /models dir
    await initializeDynamicModels(app);

    app.listen(PORT, () => {
      console.log(`[Server] Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('[Server] Failed to start server:');
    console.error(error);
    process.exit(1);
  }
};

startServer();
