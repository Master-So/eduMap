import express from 'express';
import { generateTest } from '../controllers/testController.js';

const router = express.Router();

// POST request to /api/tests/generate
router.post('/generate', generateTest);

export default router;