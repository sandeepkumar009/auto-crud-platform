import express from 'express';
import { publishModel } from '../controllers/modelDefinitionController.js';
import { protect, checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/publish', 
  protect,
  checkAdmin,
  publishModel
);

export default router;
