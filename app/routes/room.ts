import { Router } from 'express';
import roomControllers from '../controllers/room';
import auth from '../middleware/auth';

const router = Router();

router.use(auth.authCheckMiddleware);
router.post('/new', roomControllers.createRoom);

export default router;
