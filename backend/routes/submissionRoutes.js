import express from 'express';
import { submitTest } from '../controllers/submissionController.js';

const router = express.Router();

// POST request to /api/submissions/submit
router.post('/submit', submitTest);

export default router;