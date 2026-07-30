import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { requireAuth } from '../middlewares/authMiddleware.js';
import {
  getStreakStatus,
  getDailyQuestion,
  submitDailyAnswer,
  getLeaderboard
} from '../controllers/dailyChallengeController.js';

const router = express.Router();

// Helper to safely get upload directory
const getUploadDir = () => {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const baseDir = isServerless ? os.tmpdir() : process.cwd();
  const targetDir = path.join(baseDir, 'uploads');
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[DailyChallengeRoutes] Cannot create dir ${targetDir}:`, err.message);
  }
  return targetDir;
};

// Multer configuration for temporary audio file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadDir());
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'audio-daily-' + uniqueSuffix + (path.extname(file.originalname) || '.webm'));
  }
});

const upload = multer({ storage: storage });

// All routes are protected by requireAuth JWT middleware
router.use(requireAuth);

router.get('/streak', getStreakStatus);
router.get('/question', getDailyQuestion);
router.get('/leaderboard', getLeaderboard);
router.post('/submit', upload.single('audio'), submitDailyAnswer);

export default router;
