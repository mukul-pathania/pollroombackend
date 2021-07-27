/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import passport from 'passport';
import UserService from '../services/UserService';

const SignUpWithEmailPassword = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.json({
        error: true,
        message: 'Please provide all three of username, email and password',
      });

    const response = await UserService.signUpWithEmailPassword(
      username,
      email,
      password,
    );

    return res.json(response);
  } catch (error) {
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
        console.log(err);
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
    const response = await UserService.verifySignUpEmail(token);
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json({
      message: 'An error occured while processing your request',
    });
  }
};

const googleSignUpCallback = (req: Request, res: Response) => {
  passport.authenticate('googleSignup', {}, (err, user, message) => {
    return res.json({ ...message });
  })(req, res);
};

const googleLoginCallback = (req: Request, res: Response) => {
  passport.authenticate('googleSignup', {}, (err, user, message) => {
    return res.json({ ...message });
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
};
