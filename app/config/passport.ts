import { PassportStatic } from 'passport';
import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';

const INCORRECT_USERNAME_PASSWORD = 'Incorrect username or password';
const SUCCESS_MESSAGE = 'Login successful';
const ERROR_MESSAGE = 'An error occured while processing your request';

export default function SetUpPassportAuth(passport: PassportStatic): void {
  passport.use(
    new passportLocal.Strategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
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
