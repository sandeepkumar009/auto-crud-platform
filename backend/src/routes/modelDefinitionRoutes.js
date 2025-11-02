import express from 'express';
import { 
  publishModel,
  getAllModelNames,
  getModelDefinition
} from '../controllers/modelDefinitionController.js';
import { protect, checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/publish', 
  protect,
  checkAdmin,
  publishModel
);

router.get(
  '/',
  protect,
  getAllModelNames
);

router.get(
  '/:modelName',
  protect,
  getModelDefinition
);

export default router;
