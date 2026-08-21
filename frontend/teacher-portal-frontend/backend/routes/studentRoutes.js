import express from 'express';
import { connectStudentToTeacher, getPublishedQuizzes, getPublishedQuiz, submitStudentQuiz, getStudentSubmissions } from '../controllers/studentController.js';
import { requireAuth, requireStudent } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/connect', requireAuth, requireStudent, connectStudentToTeacher);
router.get('/quizzes', requireAuth, requireStudent, getPublishedQuizzes);
router.get('/quizzes/:id', requireAuth, requireStudent, getPublishedQuiz);
router.post('/quizzes/:id/submit', requireAuth, requireStudent, submitStudentQuiz);
router.get('/submissions', requireAuth, requireStudent, getStudentSubmissions);
export default router;

