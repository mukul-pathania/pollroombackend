import { Server, Socket } from 'socket.io';
import JWT from 'jsonwebtoken';
import config from '.';

const registerSocketEventHandlers = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      JWT.verify(token, config.SOCKET_TOKEN_SECRET);
    } catch (error) {
      console.log('Socket connection failure: ', error.message);
      const err = new Error('Invalid token');
      return next(err);
    }
    next();
  });
  io.on('connection', (socket: Socket) => {
    console.log('emitting message');
    socket.on('disconnect', (reason) => {
      console.log(`socket ${socket.id} disconnected due to reason ${reason}`);
    });
    socket.emit('message', 'hello');
  });
};

export default registerSocketEventHandlers;
