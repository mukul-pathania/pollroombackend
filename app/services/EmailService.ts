import { user } from '@prisma/client';
import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';
import config from '../config';
import prisma from '../prismaClient';
import logger from '../util/logger';

const Transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

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
    const info = await Transporter.sendMail({
      from: 'PollRoom',
      to: user.email,
      subject: 'Reset your password',
      html: HTML,
    });
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
    const info = await Transporter.sendMail({
      from: 'PollRoom',
      to: user.email,
      subject: 'Confirm your email for PollRoom sign up',
      html: HTML,
    });
    logger.log('info', 'emailservice:sendsignupemail %O', info);
  } catch (error) {
    logger.log('error', 'emailservice:sendsignupemail %O', error);
  }
};

export default { sendSignUpEmail, sendPasswordResetEmail };
