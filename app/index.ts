import { createServer } from 'http';
import express, { Express } from 'express';
import { Server } from 'socket.io';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import setUpPassportAuth from './config/passport';
import cors from 'cors';
import routes from './routes';
import config from './config';
import registerSocketEventHandlers from './config/socketio';
dotenv.config();

const PORT = config.PORT || 3000;

const startServer = (): void => {
  const app: Express = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  app.use(helmet());
  app.use(
    cors({
      origin:
        config.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : config.CORS_ORIGIN,
      credentials: true,
    }),
  );

  setUpPassportAuth(passport);
  registerSocketEventHandlers(io);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', routes);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
  });
};

export { startServer };
