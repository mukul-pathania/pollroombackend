import { Router } from 'express';
import profile from '../controllers/profile.controllers';
import authMiddleware from '../middleware/auth.middlewares';

const router = Router();
router.use(authMiddleware.authCheckMiddleware);
router.get('/dashboard', profile.dashBoardInfo);

export default router;
