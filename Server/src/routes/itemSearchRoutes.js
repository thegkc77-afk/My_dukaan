import express from 'express';
import * as itemSearchController from '../controllers/itemSearchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/search', itemSearchController.searchItems);
router.get('/:id', itemSearchController.getItemById);

export default router;
