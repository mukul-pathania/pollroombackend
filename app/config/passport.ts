import { PassportStatic } from 'passport';
import passportLocal from 'passport-local';
import passportGoogle from 'passport-google-oauth20';
import passportJWT from 'passport-jwt';
import UserService from '../services/UserService/index';
import config from './index';
import logger from '../util/logger';

const ERROR_MESSAGE = 'An error occured while processing your request';
const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET;

export default function SetUpPassportAuth(passport: PassportStatic): void {
  passport.use(
    new passportJWT.Strategy(
      {
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.TOKEN_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await UserService.auth.getUserByUserName(
            jwt_payload.username,
          );
          return done(null, user);
        } catch (error) {
          logger.log('error', 'Error in jwt passport: %O', error);
          return done(null, false, {
            message: 'An error occured while processing your request',
            error: true,
          });
        }
      },
    ),
  );

  passport.use(
    new passportLocal.Strategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const response =
            await UserService.auth.getUserForPassportLocalStrategy(
              email,
              password,
            );
          return done(null, response.user, {
            message: response.message,
          });
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
          const response =
            await UserService.auth.getUserForPassportGoogleSignUpStrategy(
              profile.emails?.[0].value as string,
              `${profile.displayName}${profile.id}`,
            );
          return done(null, response.user, {
            message: response.message,
            error: response.error,
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
          const response =
            await UserService.auth.getUserForPassportGoogleLoginStrategy(
              profile.emails?.[0].value as string,
            );
          return done(null, response.user, {
            message: response.message,
            error: response.error,
          });
        } catch (error) {
          logger.log('error', 'Error in googleLogin passport: %O', error);
          return done(null, undefined, {
            message: 'An error occured while processing your request',
            error: true,
          });
        }
      },
    ),
  );
}
