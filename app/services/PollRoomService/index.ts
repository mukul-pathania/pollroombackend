import { user } from '@prisma/client';
import prisma from '../../prismaClient';

const createRoom = async (
  user: user,
  roomName: string,
): Promise<{ message: string; error: boolean }> => {
  try {
    const roomsCreatedByUser = await prisma.room.findMany({
      where: { creator_id: user.id },
    });
    if (roomsCreatedByUser.length >= 5)
      return {
        message: 'You have already created 5 rooms, delete some rooms first',
        error: true,
      };
    const isNameTaken = await prisma.room.findFirst({
      where: { name: roomName },
    });
    if (isNameTaken)
      return { message: 'This name is already registered', error: true };
    await prisma.room.create({
      data: { creator_id: user.id, name: roomName },
    });
    return { message: 'Success', error: false };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: 'An error occured while processing your request',
    };
  }
};

type roomInfo = {
  name: string;
  created_at: Date;
  creator: {
    username: string;
    id: string;
  };
  polls: {
    id: string;
    created_at: Date;
    question: string;
    options: {
      id: string;
      created_at: Date;
      option_text: string;
      _count: {
        votes: number;
      } | null;
    }[];
  }[];
} | null;

type votesByUser =
  | {
      option: {
        poll_id: string;
      };
      option_id: string;
    }[]
  | null;

const getRoomInfo = async (
  userId: string,
  roomId: string,
): Promise<{
  message: string;
  roomInfo: roomInfo;
  votesByUser: votesByUser;
  error: boolean;
}> => {
  try {
    const roomInfo = await prisma.room.findFirst({
      where: { id: roomId },
      select: {
        creator: { select: { username: true, id: true } },
        created_at: true,
        name: true,
        polls: {
          orderBy: [{ created_at: 'asc' }],
          select: {
            id: true,
            question: true,
            created_at: true,
            options: {
              orderBy: [{ created_at: 'asc' }],
              select: {
                id: true,
                option_text: true,
                created_at: true,
                _count: { select: { votes: true } },
              },
            },
          },
        },
      },
    });
    const votesByUser = await prisma.vote.findMany({
      where: {
        option: { poll: { room_id: roomId } },
        user_id: userId,
      },
      select: { option_id: true, option: { select: { poll_id: true } } },
    });
    if (!roomInfo)
      return {
        message: 'No such room exists',
        error: true,
        roomInfo: null,
        votesByUser: null,
      };
    return { message: 'Success', error: false, roomInfo, votesByUser };
  } catch (error) {
    console.log(error);
    return {
      message: 'An error occured while processing your request',
      error: true,
      roomInfo: null,
      votesByUser: null,
    };
  }
};

export default { createRoom, getRoomInfo };
