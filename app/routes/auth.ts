import { Router } from 'express';
import passport from 'passport';
import authControllers from '../controllers/auth';

const router = Router();

router.post('/signup', authControllers.SignUpWithEmailPassword);

router.post('/login', authControllers.loginWithEmailPassword);

router.get('/logout', authControllers.logout);

router.get('/verify', authControllers.verify);

router.get(
  '/google/signup',
  passport.authenticate('googleSignup', {
    scope: ['profile', 'email'],
  }),
);

router.get('/google/signup/callback', authControllers.googleSignUpCallback);

router.get(
  '/google/login',
  passport.authenticate('googleLogin', {
    scope: ['profile', 'email'],
  }),
);

router.get('/google/login/callback', authControllers.googleLoginCallback);

export default router;
