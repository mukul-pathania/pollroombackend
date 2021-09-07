import { Router } from 'express';
import passport from 'passport';
import authControllers from '../controllers/auth.controllers';
import authMiddleware from '../middleware/auth.middlewares';

const router = Router();

router.post('/signup', authControllers.SignUpWithEmailPassword);

router.post('/login', authControllers.loginWithEmailPassword);

router.get('/logout', authControllers.logout);

router.get(
  '/verify',
  authMiddleware.authCheckMiddleware,
  authControllers.verify,
);

router.post('/email/verify', authControllers.verifySignUpEmail);

router.post('/password/reset/email', authControllers.sendPasswordResetEmail);

router.post('/password/reset/change', authControllers.resetPassword);

router.get(
  '/google/signup',
  passport.authenticate('googleSignup', {
    session: false,
    scope: ['profile', 'email'],
  }),
);

router.get('/google/signup/callback', authControllers.googleSignUpCallback);

router.get(
  '/google/login',
  passport.authenticate('googleLogin', {
    session: false,
    scope: ['profile', 'email'],
  }),
);

router.get('/google/login/callback', authControllers.googleLoginCallback);

router.get('/refresh_token', authControllers.refreshTokenForUser);

export default router;
