/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import EmailService from '../services/EmailService';
import logger from '../util/logger';

const sendEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.json({
        message: 'You need to provide all three of name, email and message',
        error: true,
      });
    const response = await EmailService.sendMessageEmail(name, email, message);
    return res.json(response);
  } catch (error) {
    logger.log('error', 'profilecontroller:dashboardinfo %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

export default { sendEmail };
