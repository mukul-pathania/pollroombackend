import { Socket } from 'socket.io';
import PollService from '../services/PollService';
import logger from '../util/logger';

const RegisterPollHandlers = (socket: Socket): void => {
  const createPoll = async (
    question: string,
    options: Array<{ option_text: string }>,
  ) => {
    const response = await PollService.createPoll(
      socket.data.username,
      socket.data.roomId,
      question,
      options,
    );
    if (response.poll) {
      socket
        .to(socket.data.roomId)
        .emit('poll:created', response.poll, response.message);
      logger.info(
        `Created a new poll: ${response.poll.id} in room: ${socket.data.roomId}`,
      );
    }
  };

  socket.on('poll:create', createPoll);
};

export default RegisterPollHandlers;
