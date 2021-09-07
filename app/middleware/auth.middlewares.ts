/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, NextFunction, Response } from 'express';
import passport from 'passport';
import logger from '../util/logger';

const authCheckMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    function (err, user, message) {
      if (err || !user) {
        return res.status(401).json({
          message: message?.message || 'You are not authenticated',
          error: true,
        });
      }
      req.logIn(user, { session: false }, function (err) {
        if (err) {
          logger.log('error', 'authmiddleware:authcheckmiddleware %O', err);
          return res.status(401).json({
            message: 'You are not authenticated',
            error: true,
          });
        }
        return next();
      });
    },
  )(req, res, next);
};

export default { authCheckMiddleware };
