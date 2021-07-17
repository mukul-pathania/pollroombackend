/* eslint-disable @typescript-eslint/no-namespace */
import { PassportStatic } from 'passport';
import passportLocal from 'passport-local';

declare global {
  namespace Express {
    interface User {
      id?: number | undefined;
      name?: string;
    }
  }
}

const testUser = {
  id: 1,
  name: 'testuser',
  password: 'test1234',
  email: 'test@test.com',
};

export default function SetUpPassportAuth(passport: PassportStatic) {
  passport.use(
    new passportLocal.Strategy(
      { usernameField: 'email', passReqToCallback: true },
      (req, email, password, done) => {
        if (email != testUser.email || password != testUser.password)
          return done(null, false);
        return done(null, testUser);
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    done(null, testUser);
  });
}
