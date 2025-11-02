import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsDir = path.join(__dirname, '..', '..', 'models');

// In-memory cache for our dynamic Sequelize models
const dynamicModels = {};

// Helper function to convert JSON field types to Sequelize DataTypes
const mapSequelizeType = (jsonType) => {
  switch (jsonType) {
    case 'string':
      return DataTypes.STRING;
    case 'number':
      return DataTypes.FLOAT;
    case 'boolean':
      return DataTypes.BOOLEAN;
    case 'date':
      return DataTypes.DATE;
    case 'text':
      return DataTypes.TEXT;
    default:
      return DataTypes.STRING;
  }
};

// Creates and syncs a Sequelize model from a model definition
const createSequelizeModel = async (modelDefinition) => {
  const { name, fields } = modelDefinition;

  const schema = {};
  for (const field of fields) {
    schema[field.name] = {
      type: mapSequelizeType(field.type),
      allowNull: !field.required,
      unique: field.unique || false,
      defaultValue: field.default,
    };
  }

  // Add ownerId if it's defined for RBAC
  if (modelDefinition.ownerField) {
    schema[modelDefinition.ownerField] = {
      type: DataTypes.UUID, // Assuming owners are Users, which have UUID PKs
      allowNull: true,
    };
  }

  // Define the model with Sequelize
  const model = sequelize.define(name, schema);

  // Sync with DB (creates/alters table)
  await model.sync({ alter: true });
  console.log(`[Dynamic] Synced model and table for: ${name}`);

  // Cache the model
  dynamicModels[name] = model;
  return model;
};

// Creates a new Express Router with full CRUD and RBAC
const createDynamicRouter = (model, rbac, ownerField) => {
  const router = express.Router();
  const modelName = model.name;

  // Dynamic RBAC Middleware Factory
  // This function *creates* a middleware for a specific operation
  const checkAccess = (operation) => (req, res, next) => {
    const role = req.user.role; // From 'protect' middleware
    if (!role || !rbac[role]) {
      return res.status(403).json({ message: 'Forbidden: No permissions for this role' });
    }

    const permissions = rbac[role];

    if (permissions.includes('all') || permissions.includes(operation)) {
      next(); // Access granted
    } else {
      return res.status(403).json({ message: `Forbidden: Role '${role}' cannot perform '${operation}'` });
    }
  };

  // Apply Routes
  // POST /api/<modelName> - Create
  router.post('/', protect, checkAccess('create'), async (req, res) => {
    try {
      let data = req.body;
      // If an ownerField is defined, stamp the new record with the current user's ID
      if (ownerField) {
        data[ownerField] = req.user.id;
      }
      const record = await model.create(data);
      res.status(201).json(record);
    } catch (e) {
      res.status(400).json({ message: 'Error creating record', error: e.message });
    }
  });

  // GET /api/<modelName> - Read All
  router.get('/', protect, checkAccess('read'), async (req, res) => {
    try {
      const records = await model.findAll();
      res.status(200).json(records);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching records', error: e.message });
    }
  });

  // GET /api/<modelName>/:id - Read One
  router.get('/:id', protect, checkAccess('read'), async (req, res) => {
    try {
      const record = await model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      res.status(200).json(record);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching record', error: e.message });
    }
  });

  // PUT /api/<modelName>/:id - Update
  router.put('/:id', protect, checkAccess('update'), async (req, res) => {
    try {
      const record = await model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });

      // Ownership Check
      if (ownerField && req.user.role !== 'Admin' && record[ownerField] !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this record' });
      }

      const updatedRecord = await record.update(req.body);
      res.status(200).json(updatedRecord);
    } catch (e) {
      res.status(400).json({ message: 'Error updating record', error: e.message });
    }
  });

  // DELETE /api/<modelName>/:id - Delete
  router.delete('/:id', protect, checkAccess('delete'), async (req, res) => {
    try {
      const record = await model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });

      // Ownership Check
      if (ownerField && req.user.role !== 'Admin' && record[ownerField] !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this record' });
      }

      await record.destroy();
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: 'Error deleting record', error: e.message });
    }
  });

  return router;
};

// Registers a model and mounts its router to the app
export const registerAndMount = async (modelDefinition, app) => {
  try {
    const model = await createSequelizeModel(modelDefinition);
    const router = createDynamicRouter(model, modelDefinition.rbac, modelDefinition.ownerField);
    
    // Mount the new router
    const apiPath = `/api/${modelDefinition.name.toLowerCase()}`;
    app.use(apiPath, router);
    
    console.log(`[Dynamic] Mounted CRUD routes for ${modelDefinition.name} at ${apiPath}`);
  } catch (error) {
    console.error(`Failed to register model ${modelDefinition.name}:`, error);
  }
};

// Initializes all models from the /models directory on server start
export const initializeDynamicModels = async (app) => {
  console.log('[Dynamic] Initializing models from file system...');
  if (!fs.existsSync(modelsDir)) {
    console.log('[Dynamic] /models directory not found, skipping initialization.');
    return;
  }

  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('[Dynamic] No models found in /models directory.');
  }

  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const modelDefinition = JSON.parse(fileContent);
      
      // Register and mount this model
      await registerAndMount(modelDefinition, app);

    } catch (error) {
      console.error(`Error loading model from ${file}:`, error);
    }
  }
};
