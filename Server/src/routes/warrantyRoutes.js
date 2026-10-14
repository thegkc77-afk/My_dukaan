import express from 'express';
import * as warrantyController from '../controllers/warrantyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/lookup', warrantyController.lookupWarranty);

export default router;
