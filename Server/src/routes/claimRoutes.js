import express from 'express';
import * as claimController from '../controllers/claimController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createClaimSchema, updateClaimStatusSchema } from '../validators/claimValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateRequest(createClaimSchema), claimController.createClaim);
router.get('/', claimController.listClaims);
router.get('/:id', claimController.getClaimById);
router.patch('/:id', claimController.updateClaim);
router.patch('/:id/status', validateRequest(updateClaimStatusSchema), claimController.updateClaimStatus);

export default router;
