import { PassportStatic } from 'passport';
import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';

const ERROR_MESSAGE = 'Incorrect username or password';
const SUCCESS_MESSAGE = 'Login successful';

export default function SetUpPassportAuth(passport: PassportStatic): void {
  passport.use(
    new passportLocal.Strategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const user = await prisma.user.findFirst({ where: { email: email } });
          let match;
          if (user)
            match = await bcrypt.compare(password, user.encrypted_password);
          if (!user || !match)
            return done(null, false, {
              message: ERROR_MESSAGE,
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
