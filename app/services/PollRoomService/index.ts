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
  creator: {
    id: string;
    username: string;
  };
  created_at: Date;
  name: string;
  polls: {
    created_at: Date;
    id: string;
    question: string;
    options: {
      created_at: Date;
      id: string;
      option_text: string;
      _count: { votes: number } | null;
      votes:
        | {
            id: string;
          }[];
    }[];
  }[];
} | null;

const getRoomInfo = async (
  userId: string,
  roomId: string,
): Promise<{
  message: string;
  roomInfo: roomInfo;
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
                votes: { where: { user_id: userId }, select: { id: true } },
              },
            },
          },
        },
      },
    });
    if (!roomInfo)
      return {
        message: 'No such room exists',
        error: true,
        roomInfo: null,
      };
    return { message: 'Success', error: false, roomInfo };
  } catch (error) {
    console.log(error);
    return {
      message: 'An error occured while processing your request',
      error: true,
      roomInfo: null,
    };
  }
};

export default { createRoom, getRoomInfo };
