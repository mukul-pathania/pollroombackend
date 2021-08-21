import { createServer, Server as HTTPServer } from 'http';
import express, { Express } from 'express';
import { Server } from 'socket.io';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import expressWinston from 'express-winston';
import winston from 'winston';
import setUpPassportAuth from './config/passport';
import cors from 'cors';
import routes from './routes';
import config from './config';
import registerSocketEventHandlers from './config/socketio';
import logger from './util/logger';

dotenv.config();

const PORT = config.PORT || 3000;

const startServer = (): HTTPServer => {
  const app: Express = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    }),
  );

  setUpPassportAuth(passport);
  if (config.NODE_ENV != 'test') {
    app.use(
      expressWinston.logger({
        meta: false,
        transports: [new winston.transports.Console()],
        expressFormat: true,
      }),
    );
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(passport.initialize());

  registerSocketEventHandlers(io);
  app.use('/', routes);

  return httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
  });
};

export { startServer };
