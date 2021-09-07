import logger from '../util/logger';
import prisma from '../prismaClient';
import { poll } from '.prisma/client';

const createPoll = async (
  username: string,
  roomId: string,
  question: string,
  options: Array<{ option_text: string }>,
): Promise<{ poll: poll | null; message: string }> => {
  try {
    const isUserAdmin = await prisma.room.findFirst({
      where: { creator: { username: username }, id: roomId },
    });
    if (!isUserAdmin) {
      return {
        poll: null,
        message: 'You are not authorized to create polls in this room',
      };
    }
    const createdPoll = await prisma.poll.create({
      data: { question, room_id: roomId, options: { create: [...options] } },
    });
    return { poll: createdPoll, message: 'Poll Created successfully' };
  } catch (error) {
    logger.log('error', 'pollservice:createpoll  %O', error);
    return {
      poll: null,
      message: 'An error occured while processing your request',
    };
  }
};

export default { createPoll };
