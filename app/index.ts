import express, { Express } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import setUpPassportAuth from './config/passport';
import cors from 'cors';
import routes from './routes';

dotenv.config();
const PORT = process.env.PORT || 3000;

const startServer = (): Express.Application => {
  const app: Express = express();

  app.use(helmet());
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : process.env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  setUpPassportAuth(passport);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || '89yh4tqonds98aofawdmlk3',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', routes);

  return app.listen(PORT, () =>
    console.log(`Server running on ${PORT} in ${process.env.NODE_ENV} mode`),
  );
};

export { startServer };
