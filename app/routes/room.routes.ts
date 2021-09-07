import { Router } from 'express';
import roomControllers from '../controllers/room.controllers';
import auth from '../middleware/auth.middlewares';

const router = Router();

router.use(auth.authCheckMiddleware);
router.post('/new', roomControllers.createRoom);
router.get('/:id', roomControllers.getRoomInfo);
router.post('/join', roomControllers.joinRoom);

export default router;
