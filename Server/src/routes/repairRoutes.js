import express from 'express';
import * as repairController from '../controllers/repairController.js';
import * as handoverController from '../controllers/handoverController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createRepairSchema,
  updateRepairSchema,
  updateRepairStatusSchema
} from '../validators/repairValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateRequest(createRepairSchema), repairController.createRepair);
router.get('/', repairController.listRepairs);
router.get('/:id', repairController.getRepairById);
router.patch('/:id', validateRequest(updateRepairSchema), repairController.updateRepair);
router.patch('/:id/status', validateRequest(updateRepairStatusSchema), repairController.updateRepairStatus);
router.delete('/:id', repairController.deleteRepair);
router.get('/:id/handover', handoverController.getRepairHandover);

export default router;
