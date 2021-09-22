import { Router } from 'express';
import authRoutes from './auth.routes';
import roomRoutes from './room.routes';
import userRoutes from './user.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/room', roomRoutes);
router.use('/user', userRoutes);
router.use('/review', reviewRoutes);

export default router;
