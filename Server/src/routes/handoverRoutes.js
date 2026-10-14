import express from 'express';
import * as handoverController from '../controllers/handoverController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createHandoverSchema } from '../validators/handoverValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateRequest(createHandoverSchema), handoverController.createHandover);
router.get('/', handoverController.listHandovers);
router.get('/:id', handoverController.getHandoverById);

export default router;
