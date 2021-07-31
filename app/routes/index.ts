import { Router } from 'express';
import authRoutes from './auth';
import roomRoutes from './room';

const router = Router();

router.use('/auth', authRoutes);
router.use('/room', roomRoutes);

export default router;
