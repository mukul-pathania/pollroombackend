import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import setUpPassportAuth from './config/passport';
import cors from 'cors';

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

  app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello from the TypeScript world!</h1>');
  });

  app.get('/test', (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  app.get('/success', (req: Request, res: Response) => {
    res.json({ message: 'login successful' });
  });

  app.get('/failure', (req: Request, res: Response) => {
    res.json({ message: 'login failed' });
  });

  app.post(
    '/auth/login',
    passport.authenticate('local', {
      successRedirect: '/success',
      failureRedirect: '/failure',
    }),
  );

  app.get('/auth/logout', (req: Request, res: Response) => {
    req.logOut();
    res.send('logged out');
  });

  app.get('/auth/verify', (req: Request, res: Response) => {
    if (req.user)
      return res
        .json({
          message: 'You are authenticated',
          isAuthenticated: true,
          error: false,
        })
        .status(200);
    else
      return res.status(401).json({
        message: 'You are not authenticated',
        isAuthenticated: false,
        error: false,
      });
  });

  return app.listen(PORT, () =>
    console.log(`Server running on ${PORT} in ${process.env.NODE_ENV} mode`),
  );
};

export { startServer };
