import { PassportStatic } from 'passport';
import passportLocal from 'passport-local';
import passportGoogle from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';

const INCORRECT_USERNAME_PASSWORD = 'Incorrect username or password';
const SUCCESS_MESSAGE = 'Login successful';
const ERROR_MESSAGE = 'An error occured while processing your request';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

export default function SetUpPassportAuth(passport: PassportStatic): void {
  passport.use(
    new passportLocal.Strategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          console.log('local strategy running');
          const user = await prisma.user.findFirst({
            where: { email: email, provider: 'EMAIL' },
          });
          let match;
          if (user)
            match = await bcrypt.compare(
              password,
              user?.encrypted_password as string,
            );
          if (!user || !match)
            return done(null, false, {
              message: INCORRECT_USERNAME_PASSWORD,
            });
          return done(null, user, { message: SUCCESS_MESSAGE });
        } catch (error) {
          return done(null, false, {
            message: ERROR_MESSAGE,
          });
        }
      },
    ),
  );

  passport.use(
    'googleSignup',
    new passportGoogle.Strategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/signup/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const user = await prisma.user.findFirst({
            where: { email: profile.emails?.[0].value },
          });
          if (user)
            return done(null, undefined, {
              message: 'Email already registered',
              error: true,
            });
          const createdUser = await prisma.user.create({
            data: {
              username: `${profile.displayName}${profile.id}`,
              provider: 'GOOGLE',
              email: profile.emails?.[0].value as string,
            },
          });
          return done(null, createdUser, {
            message: 'Signed up successfully',
            error: false,
          });
        } catch (error) {
          done(null, undefined, {
            message: 'An error occured while processing your request',
            error: true,
          });
        }
      },
    ),
  );

  passport.use(
    'googleLogin',
    new passportGoogle.Strategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/login/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const user = await prisma.user.findFirst({
            where: { email: profile.emails?.[0].value, provider: 'GOOGLE' },
          });
          if (!user)
            return done(null, undefined, {
              message:
                'Your google account is not connected with your PollRoom account, try signing in with email instead',
              error: true,
            });
          return done(null, user, {
            message: 'Logged in successfully',
            error: false,
          });
        } catch (error) {
          return done(null, undefined, {
            message: 'An error occured while processing your request',
            error: true,
          });
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findFirst({ where: { id: id as string } });
      if (user) return done(false, user);
      return done(false, null);
    } catch (error) {
      return done(null, false);
    }
  });
}
