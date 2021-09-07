import { Server, Socket } from 'socket.io';
import JWT from 'jsonwebtoken';
import config from '.';
import logger from '../util/logger';
import RegisterPollHandlers from '../socketHandlers/PollHandlers';

const registerSocketEventHandlers = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const { username, roomId } = JWT.verify(
        token,
        config.SOCKET_TOKEN_SECRET,
      ) as { username: string; roomId: string };
      logger.info(`user: ${username} is listening to roomId: ${roomId}`);
      socket.data.username = username;
      socket.data.roomId = roomId;
    } catch (error) {
      logger.log('error', 'Socket connection failure: %O', error);
      const err = new Error('Invalid token');
      return next(err);
    }
    next();
  });
  io.on('connection', (socket: Socket) => {
    socket.on('disconnect', (reason) => {
      logger.info(`socket ${socket.id} disconnected due to reason ${reason}`);
    });

    RegisterPollHandlers(socket);
  });
};

export default registerSocketEventHandlers;
