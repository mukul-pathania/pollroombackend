/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NextFunction, Request, Response } from 'express';
import hcaptcha from 'hcaptcha';
import logger from '../util/logger';

const validate =
  (HCAPTCHA_SECRET_KEY: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body && req.body.hCaptchaToken;

    // call next with an error if no token present
    if (!token) {
      return res
        .status(403)
        .json({ message: 'No hcaptcha token found', error: true });
    }
    try {
      const data = await hcaptcha.verify(HCAPTCHA_SECRET_KEY, token);
      if (data.success) return next();
      return res.status(403).json({ message: 'Invalid hcaptcha', error: true });
    } catch (error) {
      logger.log('error', 'hcaptchamiddleware:validate %O', error);
      return res.status(403).json({
        message: 'An error occured while processing your request',
        error: true,
      });
    }
  };

export default { validate };
