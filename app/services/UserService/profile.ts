import prisma from '../../prismaClient';
import logger from '../../util/logger';

type createdRooms = {
  id: string;
  name: string;
  created_at: Date;
  _count: {
    polls: number;
    users: number;
  } | null;
}[];
const dashBoardInfo = async (
  userId: string,
): Promise<{
  error: boolean;
  message: string;
  roomsJoined: number;
  pollsCreated: number;
  votesCasted: number;
  createdRooms: createdRooms;
}> => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        rooms_created: {
          select: {
            polls: {
              select: { id: true },
            },
          },
        },
        rooms: {
          select: {
            id: true,
          },
        },
        votes: {
          select: { id: true },
        },
      },
    });

    const createdRooms = await prisma.room.findMany({
      where: { creator_id: userId },
      select: {
        name: true,
        created_at: true,
        id: true,
        _count: { select: { polls: true, users: true } },
      },
      orderBy: [{ created_at: 'asc' }],
    });
    const pollsCreated = user?.rooms_created.reduce((result, item) => {
      return result + item.polls.length;
    }, 0);
    return {
      message: 'Success',
      error: false,
      roomsJoined: user?.rooms.length || 0,
      votesCasted: user?.votes.length || 0,
      pollsCreated: pollsCreated || 0,
      createdRooms: createdRooms,
    };
  } catch (error) {
    logger.log('error', 'userservice:profile:dashboardinfo %O', error);
    return {
      message: 'An error occured while processing your request',
      error: true,
      roomsJoined: 0,
      votesCasted: 0,
      pollsCreated: 0,
      createdRooms: [],
    };
  }
};

type pollsCreatedType = {
  id: string;
  created_at: Date;
  _count: {
    vote: number;
  } | null;
  room: {
    name: string;
  };
  question: string;
  room_id: string;
}[];

const pollsCreated = async (
  userId: string,
): Promise<{
  error: boolean;
  message: string;
  pollsCreated: pollsCreatedType;
}> => {
  try {
    const polls = await prisma.poll.findMany({
      where: { room: { creator_id: userId } },
      select: {
        room: { select: { name: true } },
        question: true,
        room_id: true,
        created_at: true,
        id: true,
        _count: { select: { vote: true } },
      },
    });
    return { message: 'Success', error: false, pollsCreated: polls };
  } catch (error) {
    logger.log('error', 'userservice:profile:pollscreated %O', error);
    return {
      message: 'An error occured while processing your request',
      error: true,
      pollsCreated: [],
    };
  }
};

export default { dashBoardInfo, pollsCreated };
