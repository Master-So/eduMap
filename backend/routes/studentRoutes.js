import express from 'express';
import { connectStudentToTeacher, disconnectStudentFromTeacher, getPublishedQuizzes, getPublishedQuiz, submitStudentQuiz, getStudentSubmissions, getQuizSubmissionResult } from '../controllers/studentController.js';
import { requireAuth, requireStudent } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/connect', requireAuth, requireStudent, connectStudentToTeacher);
router.delete('/connection', requireAuth, requireStudent, disconnectStudentFromTeacher);
router.get('/quizzes', requireAuth, requireStudent, getPublishedQuizzes);
router.get('/quizzes/:id', requireAuth, requireStudent, getPublishedQuiz);
router.get('/quizzes/:id/result', requireAuth, requireStudent, getQuizSubmissionResult);
router.post('/quizzes/:id/submit', requireAuth, requireStudent, submitStudentQuiz);
router.get('/submissions', requireAuth, requireStudent, getStudentSubmissions);
export default router;

