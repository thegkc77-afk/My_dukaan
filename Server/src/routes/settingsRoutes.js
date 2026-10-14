import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateSettingsSchema, createStaffSchema } from '../validators/settingsValidators.js';

const router = express.Router();

router.use(authenticate);

// Settings
router.get('/', settingsController.getSettings);
router.patch('/', requireRole('owner', 'manager'), validateRequest(updateSettingsSchema), settingsController.updateSettings);

// Staff Management
router.get('/staff', requireRole('owner', 'manager'), settingsController.listStaff);
router.post('/staff', requireRole('owner'), validateRequest(createStaffSchema), settingsController.createStaff);
router.patch('/staff/:id', requireRole('owner'), settingsController.updateStaff);
router.patch('/staff/:id/active', requireRole('owner'), settingsController.toggleStaffActive);

// Backup and Restore (restricted to Owners)
router.get('/backup/export', requireRole('owner'), settingsController.exportBackup);
router.post('/backup/import', requireRole('owner'), settingsController.importBackup);

export default router;
