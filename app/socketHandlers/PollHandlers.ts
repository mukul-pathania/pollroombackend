import { Server, Socket } from 'socket.io';
import PollService from '../services/PollService';
import logger from '../util/logger';

const RegisterPollHandlers = (socket: Socket, io: Server): void => {
  const createPoll = async (
    question: string,
    options: Array<{ option_text: string }>,
  ) => {
    const response = await PollService.createPoll(
      socket.data.userId,
      socket.data.roomId,
      question,
      options,
    );
    if (response.poll) {
      io.to(socket.data.roomId).emit(
        'poll:created',
        response.poll,
        response.message,
      );
      logger.info(
        `Created a new poll: ${response.poll.id} in room: ${socket.data.roomId}`,
      );
    }
  };

  const addOrUpdateVote = async (
    pollId: string,
    optionId: string,
  ): Promise<void> => {
    const response = await PollService.addOrUpdateVote(
      pollId,
      optionId,
      socket.data.userId,
    );
    logger.info(
      `new or updated vote for pollId: ${pollId} optionId: ${optionId} userId: ${socket.data.userId}`,
    );
    io.to(socket.data.roomId).emit(
      'poll:updated:vote',
      response.poll,
      response.message,
    );
  };

  socket.on('poll:create', createPoll);
  socket.on('poll:castvote', addOrUpdateVote);
};

export default RegisterPollHandlers;
