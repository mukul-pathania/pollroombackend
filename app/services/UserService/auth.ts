import { user, Prisma } from '@prisma/client';
import prisma from '../../prismaClient';
import bcrypt from 'bcrypt';
import EmailService from '../EmailService';
import JWT from 'jsonwebtoken';

const signUpWithEmailPassword = async (
  username: string,
  email: string,
  password: string,
): Promise<{ error: boolean; message: string }> => {
  try {
    if (username.length > 40 || email.length > 40 || password.length > 40)
      return {
        message: 'No field should have length greater than 40',
        error: true,
      };
    if (username.length < 4)
      return {
        error: true,
        message: 'Username must contain atleast 4 characters',
      };
    if (password.length < 6)
      return { error: true, message: 'Password must be atleast 6 characters' };
    const hash = await bcrypt.hash(password, 15);
    const created_user = await prisma.user.create({
      data: {
        email: email,
        encrypted_password: hash,
        username: username,
        provider: 'EMAIL',
      },
    });
    EmailService.sendSignUpEmail(created_user);
    return { error: false, message: 'User signed up successfully' };
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const message = (error.meta as { target: Array<string> }).target[0];
        return {
          message: `This ${message} is already registered`,
          error: true,
        };
      }
    }
    return {
      error: true,
      message: 'An error occured while processing your request',
    };
  }
};

const getUserForPassportLocalStrategy = async (
  email: string,
  password: string,
): Promise<{ user: user | false; message: string; error: boolean }> => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email },
    });
    if (user && user.provider !== 'EMAIL') {
      return {
        message: `Your account was registered using ${
          user.provider === 'GOOGLE' ? 'Google' : 'Github'
        }`,
        error: true,
        user: false,
      };
    }
    let match;
    if (user)
      match = await bcrypt.compare(
        password,
        user?.encrypted_password as string,
      );
    if (!match || !user)
      return {
        user: false,
        message: 'Incorrect username or password',
        error: true,
      };
    if (!user.confirmed_at)
      return {
        message: 'Verify your email before logging in',
        error: true,
        user: false,
      };
    return {
      user: user,
      message: 'User logged in successfully',
      error: false,
    };
  } catch (error) {
    return {
      user: false,
      message: 'An error occured while proccessing your request',
      error: true,
    };
  }
};

const getUserForPassportGoogleSignUpStrategy = async (
  email: string,
  username: string,
): Promise<{ user: user | undefined; message: string; error: boolean }> => {
  try {
    const createdUser = await prisma.user.create({
      data: {
        username: username,
        provider: 'GOOGLE',
        email: email,
      },
    });
    return {
      user: createdUser,
      message: 'Signed up successfully',
      error: false,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return {
          message: 'This email is already registered',
          error: true,
          user: undefined,
        };
    }
    return {
      user: undefined,
      message: 'An error occured while processing your request',
      error: true,
    };
  }
};

const getUserForPassportGoogleLoginStrategy = async (
  email: string,
): Promise<{ user: user | undefined; message: string; error: boolean }> => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email, provider: 'GOOGLE' },
    });
    if (!user)
      return {
        user: undefined,
        message:
          'Your google account is not connected with your PollRoom account',
        error: true,
      };
    return {
      user: user,
      message: 'Logged in successfully',
      error: false,
    };
  } catch (error) {
    return {
      user: undefined,
      message: 'An error occured while processing your request',
      error: true,
    };
  }
};

const getUserById = async (id: string): Promise<user | null> => {
  return await prisma.user.findFirst({ where: { id: id } });
};

const verifySignUpEmail = async (
  token: string,
): Promise<{ message: string; error: boolean }> => {
  try {
    const { user_id } = JWT.decode(token) as { user_id: string };
    const user = await prisma.user.findFirst({
      where: { id: user_id, confirmation_token: token },
    });
    if (!user) return { message: 'Invalid token', error: true };
    JWT.verify(token, user.encrypted_password as string);
    await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        confirmation_token: null,
        confirmed_at: new Date(),
      },
    });
    return { message: 'Email verified successfully', error: false };
  } catch (error) {
    console.log(error);
    return {
      message: 'An error occured while processing your request',
      error: true,
    };
  }
};

const sendResetPasswordMail = async (
  email: string,
): Promise<{ message: string; error: boolean }> => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email, provider: 'EMAIL', NOT: [{ confirmed_at: null }] },
    });
    // Even if we don't find the user, don't tell that the user doesn't exist
    if (!user)
      return {
        message: 'Check your email for further instructions',
        error: false,
      };
    await EmailService.sendPasswordResetEmail(user);
    return {
      message: 'Check your email for further instructions',
      error: false,
    };
  } catch (error) {
    console.log(error);
    return {
      message: 'An error occured while processing your request',
      error: true,
    };
  }
};

const resetPassword = async (
  token: string,
  password: string,
): Promise<{ message: string; error: boolean }> => {
  try {
    const { user_id } = JWT.decode(token) as { user_id: string };
    const user = await prisma.user.findFirst({
      where: { id: user_id, recovery_token: token },
    });
    if (!user) return { message: 'Invalid token', error: true };
    JWT.verify(token, user.encrypted_password as string);
    const hashed = await bcrypt.hash(password, 15);
    await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        recovery_token: null,
        encrypted_password: hashed,
      },
    });
    return { message: 'Password reset successfully', error: false };
  } catch (error) {
    console.log(error);
    return {
      message: 'An error occured while processing your request',
      error: true,
    };
  }
};

export default {
  signUpWithEmailPassword,
  getUserForPassportLocalStrategy,
  getUserForPassportGoogleSignUpStrategy,
  getUserForPassportGoogleLoginStrategy,
  getUserById,
  verifySignUpEmail,
  sendResetPasswordMail,
  resetPassword,
};
