/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import passport from 'passport';
import UserService from '../services/UserService/index';
import config from '../config';
import logger from '../util/logger';

const SignUpWithEmailPassword = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.json({
        error: true,
        message: 'Please provide all three of username, email and password',
      });

    const response = await UserService.auth.signUpWithEmailPassword(
      username,
      email,
      password,
    );

    return res.json(response);
  } catch (error) {
    logger.log('error', 'userservice:signupwithemailpassword  %O', error);
    return res.json({
      error: true,
      message: 'An error occured while processing your request',
    });
  }
};

const loginWithEmailPassword = (req: Request, res: Response) => {
  passport.authenticate('local', function (err, user, message) {
    if (err || !user) {
      return res.json({ ...message, error: true });
    }
    req.logIn(user, function (err) {
      if (err) {
        logger.log('error', 'userservice:loginwithemailpassword %O', err);
        return res.json({ message: 'Failed to log you in', error: true });
      }
      return res.json({ ...message });
    });
  })(req, res);
};

const logout = (req: Request, res: Response) => {
  req.logOut();
  res.json({ message: 'Logged out successfully' });
};

const verify = (req: Request, res: Response) => {
  if (req.user)
    return res
      .json({
        message: 'You are authenticated',
        isAuthenticated: true,
        username: req.user.username,
        email: req.user.email,
        error: false,
      })
      .status(200);
  else
    return res.status(401).json({
      message: 'You are not authenticated',
      isAuthenticated: false,
      error: false,
    });
};

const verifySignUpEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.json({ message: 'No token provided', error: true });
    const response = await UserService.auth.verifySignUpEmail(token);
    return res.json(response);
  } catch (error) {
    logger.log('error', 'userservice:verifysignupemail  %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

const sendPasswordResetEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ message: 'No email provided', error: true });
    const response = await UserService.auth.sendResetPasswordMail(email);
    return res.json({ message: response.message, error: response.error });
  } catch (error) {
    logger.log('error', 'userservice:sendpasswordresetemail  %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.json({
        message: 'Token and password is required',
        error: true,
      });
    if (password.length < 6)
      return res.json({
        message: 'Password should have length of atleast 6',
        error: true,
      });
    const response = await UserService.auth.resetPassword(token, password);
    return res.json(response);
  } catch (error) {
    logger.log('error', 'userservice:resetpassword %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

const googleSignUpCallback = (req: Request, res: Response) => {
  passport.authenticate('googleSignup', {}, (err, user, message) => {
    if (err || !user) {
      const encodedMessage = encodeURIComponent(message.message);
      return res.redirect(
        `${config.CLIENT_URL}/auth/google/callback/signup/failed#message=${encodedMessage}`,
      );
    }
    const encodedMessage = encodeURIComponent(message.message);
    return res.redirect(
      `${config.CLIENT_URL}/auth/google/callback/signup/success#message=${encodedMessage}`,
    );
  })(req, res);
};

const googleLoginCallback = (req: Request, res: Response) => {
  passport.authenticate('googleLogin', {}, (err, user, message) => {
    if (err || !user) {
      const encodedMessage = encodeURIComponent(message.message);
      return res.redirect(
        `${config.CLIENT_URL}/auth/google/callback/login/failed#message=${encodedMessage}`,
      );
    }
    req.logIn(user, function (err) {
      if (err) {
        const encodedMessage = encodeURIComponent(
          '#message=Failed to log you in',
        );
        return res.redirect(
          `${config.CLIENT_URL}/auth/google/callback/login/failed#${encodedMessage}`,
        );
      }
      return res.redirect(
        `${config.CLIENT_URL}/auth/google/callback/login/success`,
      );
    });
  })(req, res);
};

export default {
  SignUpWithEmailPassword,
  loginWithEmailPassword,
  logout,
  verify,
  verifySignUpEmail,
  googleLoginCallback,
  googleSignUpCallback,
  sendPasswordResetEmail,
  resetPassword,
};
