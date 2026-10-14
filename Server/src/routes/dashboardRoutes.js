import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/recent-repairs', dashboardController.getRecentRepairs);
router.get('/recent-claims', dashboardController.getRecentClaims);

export default router;
