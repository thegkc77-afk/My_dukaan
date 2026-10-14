import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/images', upload.single('image'), uploadController.handleImageUpload);

export default router;
