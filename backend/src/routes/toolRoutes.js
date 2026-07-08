import express from 'express';
import { calculateSalary, generateQuestions } from '../controllers/toolController.js';

const router = express.Router();

// Route tính lương Gross sang Net
router.post('/calculate-salary', calculateSalary);

// Route sinh câu hỏi phỏng vấn AI
router.post('/generate-questions', generateQuestions);

export default router;
