import { Router } from 'express';
import profile from '../controllers/profile';
import authMiddleware from '../middleware/auth';

const router = Router();
router.use(authMiddleware.authCheckMiddleware);
router.get('/dashboard', profile.dashBoardInfo);

export default router;
