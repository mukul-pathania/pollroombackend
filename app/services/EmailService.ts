import { user } from '@prisma/client';
import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';
import config from '../config';

const Transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

const sendSignUpEmail = async (user: user): Promise<void> => {
  const token = JWT.sign(
    { user_id: user.id },
    user.encrypted_password as string,
    {
      expiresIn: 600,
    },
  );
  const link = `${config.CLIENT_URL}/auth/password/reset/change?token=${token}`;
  const HTML = `
  <h1>Hello ${user.username}</h1>
  <p>Click <a href=${link}>here</a> to confirm your email for PollRoom sign up</p>
  `;
  try {
    const info = await Transporter.sendMail({
      from: 'PollRoom',
      to: user.email,
      subject: 'Confirm your email for PollRoom sign up',
      html: HTML,
    });
    console.log(info);
  } catch (error) {
    console.log(error);
  }
};

export default { sendSignUpEmail };
