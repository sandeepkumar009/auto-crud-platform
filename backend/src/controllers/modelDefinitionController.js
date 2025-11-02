import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAndMount } from '../services/dynamicService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '..', '..', 'models');

export const publishModel = async (req, res) => {
  try {
    const modelDefinition = req.body;

    if (!modelDefinition || !modelDefinition.name || !modelDefinition.fields) {
      return res.status(400).json({ message: 'Invalid model definition.' });
    }
    
    const modelName = modelDefinition.name.charAt(0).toUpperCase() + modelDefinition.name.slice(1);
    modelDefinition.name = modelName; // Ensure name is capitalized

    const filePath = path.join(modelsDir, `${modelName}.json`);
    
    // Ensure the /models directory exists
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(modelDefinition, null, 2));
    console.log(`[Server] Model Definition Saved: ${filePath}`);

    await registerAndMount(modelDefinition, req.app);

    return res.status(201).json({ 
      message: `Model '${modelName}' published successfully.`
    });

  } catch (error) {
    console.error('Error publishing model:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
