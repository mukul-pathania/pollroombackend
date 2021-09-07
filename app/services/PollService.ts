import logger from '../util/logger';
import prisma from '../prismaClient';
import { poll } from '.prisma/client';

type pollType = poll & {
  options: {
    id: string;
    created_at: Date;
    option_text: string;
    votes: {
      id: string;
    }[];
    _count: {
      votes: number;
    } | null;
  }[];
};

const createPoll = async (
  username: string,
  roomId: string,
  question: string,
  options: Array<{ option_text: string }>,
): Promise<{ poll: pollType | null; message: string }> => {
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
      include: {
        options: {
          orderBy: [{ created_at: 'asc' }],
          select: {
            id: true,
            option_text: true,
            created_at: true,
            _count: { select: { votes: true } },
            votes: { where: { user: { username } }, select: { id: true } },
          },
        },
      },
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
