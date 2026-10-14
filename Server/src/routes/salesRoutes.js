import express from 'express';
import * as salesController from '../controllers/salesController.js';
import * as warrantyController from '../controllers/warrantyController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createSaleSchema, updateSaleSchema } from '../validators/salesValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateRequest(createSaleSchema), salesController.createSale);
router.get('/', salesController.listSales);
router.get('/:id', salesController.getSaleById);
router.patch('/:id', validateRequest(updateSaleSchema), salesController.updateSale);
router.get('/:id/warranty', warrantyController.getSaleWarranty);

export default router;
