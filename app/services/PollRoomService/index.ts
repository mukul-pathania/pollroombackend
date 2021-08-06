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
  created_at: Date;
  name: string;
  creator: {
    username: string;
  };
  polls: {
    id: string;
    created_at: Date;
    question: string;
    options: {
      id: string;
      created_at: Date;
      option_text: string;
      isSelected?: boolean;
      votes: {
        id: string;
        option_id: string;
        created_at: Date;
        user_id: string;
      }[];
    }[];
  }[];
} | null;

const getRoomInfo = async (
  userId: string,
  roomId: string,
): Promise<{ message: string; roomInfo: roomInfo; error: boolean }> => {
  try {
    const roomInfo = await prisma.room.findFirst({
      where: { id: roomId },
      select: {
        creator: { select: { username: true } },
        created_at: true,
        name: true,
        polls: {
          select: {
            id: true,
            question: true,
            created_at: true,
            options: {
              select: {
                id: true,
                option_text: true,
                created_at: true,
                votes: {
                  select: {
                    id: true,
                    option_id: true,
                    user_id: true,
                    created_at: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!roomInfo)
      return { message: 'No such room exists', error: true, roomInfo: null };
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
