import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import setUpPassportAuth from './config/passport';

dotenv.config();
const PORT = process.env.PORT || 3000;

const startServer = (): Express.Application => {
  const app: Express = express();

  setUpPassportAuth(passport);
  app.use(helmet());
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
    res.send('login successful');
  });

  app.get('/failure', (req: Request, res: Response) => {
    res.send('login failed');
  });

  app.post(
    '/login',
    passport.authenticate('local'),
    (req: Request, res: Response) => {
      return res.send('hello');
    },
  );

  app.get('/logout', (req: Request, res: Response) => {
    req.logOut();
    res.send('logged out');
  });

  return app.listen(PORT, () =>
    console.log(`Server running on ${PORT} in ${process.env.NODE_ENV} mode`),
  );
};

export { startServer };
