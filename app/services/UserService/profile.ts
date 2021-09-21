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
      orderBy: [{ created_at: 'desc' }],
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
  sortyBy: 'popular' | 'recent',
): Promise<{
  error: boolean;
  message: string;
  pollsCreated: pollsCreatedType;
}> => {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: {
        ...(sortyBy === 'recent'
          ? { created_at: 'desc' }
          : { vote: { _count: 'desc' } }),
      },
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

type roomsJoinedType = Array<{
  id: string;
  name: string;
  created_at: Date;
  pollCount: number;
  memberCount: number;
}>;

const roomsJoined = async (
  userId: string,
): Promise<{
  error: boolean;
  message: string;
  roomsJoined: roomsJoinedType;
}> => {
  try {
    const rooms = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        rooms: {
          select: {
            id: true,
            name: true,
            created_at: true,
            polls: { select: { id: true } },
            users: { select: { id: true } },
          },
        },
      },
    });
    const roomsProcessed: roomsJoinedType =
      rooms?.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        created_at: room.created_at,
        pollCount: room.polls.length,
        memberCount: room.users.length,
      })) || [];
    return { message: 'Success', error: false, roomsJoined: roomsProcessed };
  } catch (error) {
    logger.log('error', 'userservice:profile:roomsjoined %O', error);
    return {
      message: 'An error occured while processing your request',
      roomsJoined: [],
      error: true,
    };
  }
};

type votes = Array<{
  id: string;
  voteUpdatedAt: Date;
  pollCreatedAt: Date;
  question: string;
  roomId: string;
  roomName: string;
  optionText: string;
}>;

const votesCast = async (
  userId: string,
): Promise<{ message: string; error: boolean; votes: votes }> => {
  try {
    const votes = await prisma.vote.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        updated_at: true,
        poll: {
          select: {
            room_id: true,
            question: true,
            created_at: true,
            room: { select: { name: true } },
          },
        },
        option: { select: { option_text: true } },
      },
    });
    const votesProcessed: votes = votes.map((vote) => ({
      id: vote.id,
      voteUpdatedAt: vote.updated_at,
      pollCreatedAt: vote.poll.created_at,
      question: vote.poll.question,
      roomId: vote.poll.room_id,
      optionText: vote.option.option_text,
      roomName: vote.poll.room.name,
    }));
    return { message: 'Success', error: false, votes: votesProcessed };
  } catch (error) {
    logger.log('error', 'userservice:profile:votescast %O', error);
    return {
      message: 'An error occured while processing your request',
      error: true,
      votes: [],
    };
  }
};

export default { dashBoardInfo, pollsCreated, roomsJoined, votesCast };
