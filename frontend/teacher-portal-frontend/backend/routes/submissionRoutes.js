import express from 'express';
import { submitTest } from '../controllers/submissionController.js';
import { requireAuth, requireStudent } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/submit', requireAuth, requireStudent, submitTest);
export default router;
