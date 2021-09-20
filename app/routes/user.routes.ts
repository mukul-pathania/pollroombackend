import { Router } from 'express';
import profile from '../controllers/profile.controllers';
import authMiddleware from '../middleware/auth.middlewares';

const router = Router();
router.use(authMiddleware.authCheckMiddleware);
router.get('/dashboard', profile.dashBoardInfo);
router.get('/polls', profile.pollsCreated);
router.get('/rooms-joined', profile.roomsJoined);

export default router;
