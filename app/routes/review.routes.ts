import { Router } from 'express';
import config from '../config';
import authMiddleware from '../middleware/auth.middlewares';
import reviewControllers from '../controllers/review.controllers';
import hcaptchaMiddleware from '../middleware/hcaptcha.middleware';
const router = Router();
router.use(authMiddleware.authCheckMiddleware);

router.post(
  '/email',
  hcaptchaMiddleware.validate(config.HCAPTCHA_SECRET_KEY),
  reviewControllers.sendEmail,
);

export default router;
