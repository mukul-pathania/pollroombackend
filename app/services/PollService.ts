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

const addOrUpdateVote = async (
  pollId: string,
  optionId: string,
  userId: string,
): Promise<{ message: string; poll: pollType | null }> => {
  try {
    const vote = await prisma.vote.upsert({
      where: { poll_id_user_id: { poll_id: pollId, user_id: userId } },
      create: {
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      },
      update: { option_id: optionId },
      select: {
        poll: {
          select: {
            id: true,
            question: true,
            created_at: true,
            updated_at: true,
            room_id: true,
            options: {
              orderBy: [{ option_text: 'asc' }],
              select: {
                id: true,
                option_text: true,
                created_at: true,
                _count: { select: { votes: true } },
                votes: { where: { user_id: userId }, select: { id: true } },
              },
            },
          },
        },
      },
    });
    return { message: 'Vote casted successfully', poll: vote.poll };
  } catch (error) {
    logger.log('error', 'pollservice:addorupdatevote %O', error);
    return {
      message: 'An error occured while processing your request',
      poll: null,
    };
  }
};

export default { createPoll, addOrUpdateVote };
