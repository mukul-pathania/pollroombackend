import { Server, Socket } from 'socket.io';

const registerSocketEventHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(socket);
  });
};

export default registerSocketEventHandlers;
