import { Router } from 'express';
import roomControllers from '../controllers/room';

const router = Router();

router.post('/new', roomControllers.createRoom);

export default router;
