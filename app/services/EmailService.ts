import { user } from '@prisma/client';
import JWT from 'jsonwebtoken';
import config from '../config';
import prisma from '../prismaClient';
import logger from '../util/logger';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(config.SENDGRID_API_KEY);

const sendPasswordResetEmail = async (user: user): Promise<void> => {
  try {
    const token = JWT.sign(
      { user_id: user.id },
      user.encrypted_password as string,
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        recovery_token: token,
        recovery_sent_at: new Date(),
      },
    });
    const link = `${config.CLIENT_URL}/auth/password/reset/change#token=${token}`;
    const HTML = `
    <h1>Hello ${user.username}</h1>
    <p>Click <a href=${link}>here</a> to reset your email</p>
    `;
    const msg = {
      to: user.email,
      from: config.EMAIL_USER,
      subject: 'Reset your password',
      html: HTML,
    };
    const info = await sendgrid.send(msg);
    logger.log('info', 'emailservice:sendresetpasswordemail %O', info);
  } catch (error) {
    logger.log('error', 'emailservice:sendresetpasswordemail %O', error);
  }
};

const sendSignUpEmail = async (user: user): Promise<void> => {
  try {
    const token = JWT.sign(
      { user_id: user.id },
      user.encrypted_password as string,
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        confirmation_token: token,
        confirmation_sent_at: new Date(),
      },
    });
    const link = `${config.CLIENT_URL}/auth/email/confirm#token=${token}`;
    const HTML = `
    <h1>Hello ${user.username}</h1>
    <p>Click <a href=${link}>here</a> to confirm your email for PollRoom sign up</p>
    `;
    const msg = {
      from: config.EMAIL_USER,
      to: user.email,
      subject: 'Confirm your email for PollRoom sign up',
      html: HTML,
    };

    const info = await sendgrid.send(msg);
    logger.log('info', 'emailservice:sendsignupemail %O', info);
  } catch (error) {
    logger.log('error', 'emailservice:sendsignupemail %O', error);
  }
};

export default { sendSignUpEmail, sendPasswordResetEmail };
