import { user } from '@prisma/client';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';

const signUpWithEmailPassword = async (
  username: string,
  email: string,
  password: string,
): Promise<{ error: boolean; message: string }> => {
  try {
    if (username.length > 20 || email.length > 20 || password.length > 20)
      return {
        message: 'No field should have length greater than 20',
        error: true,
      };
    if (username.length < 4)
      return {
        error: true,
        message: 'Username must contain atleast 4 characters',
      };
    if (password.length < 4)
      return { error: true, message: 'Password must be atleast 6 characters' };
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: username }] },
    });
    if (user?.email === email)
      return { error: true, message: 'This email is already registered' };
    if (user?.username === username)
      return { error: true, message: 'This username is already taken' };
    const hash = await bcrypt.hash(password, 15);
    await prisma.user.create({
      data: {
        email: email,
        encrypted_password: hash,
        username: username,
        provider: 'EMAIL',
      },
    });
    return { error: false, message: 'User signed up successfully' };
  } catch (error) {
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
      where: { email: email, provider: 'EMAIL' },
    });
    let match;
    if (user)
      match = bcrypt.compare(password, user?.encrypted_password as string);
    if (!match || !user)
      return {
        user: false,
        message: 'Incorrect username or password',
        error: true,
      };
    return { user: user, message: 'User logged in successfully', error: false };
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
    const user = await prisma.user.findFirst({ where: { email: email } });
    if (user)
      return {
        user: undefined,
        message: 'This email is already registered',
        error: true,
      };
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
          'Your google account is not connected with your PollRoom account, try signing in with email instead',
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

export default {
  signUpWithEmailPassword,
  getUserForPassportLocalStrategy,
  getUserForPassportGoogleSignUpStrategy,
  getUserForPassportGoogleLoginStrategy,
  getUserById,
};
