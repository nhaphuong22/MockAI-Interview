import express from 'express';
import { getSkillTree, getSkillTreeNodeDetails } from '../controllers/skillTreeController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getSkillTree);
router.get('/node/:nodeId', authenticateToken, getSkillTreeNodeDetails);

export default router;
