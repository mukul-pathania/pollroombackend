/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, NextFunction, Response } from 'express';

const authCheckMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      message: 'This endpoint requires authentication',
      error: true,
    });
  }
  return next();
};

export default { authCheckMiddleware };
