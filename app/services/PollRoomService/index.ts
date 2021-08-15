import { user, Prisma } from '@prisma/client';
import prisma from '../../prismaClient';

const createRoom = async (
  user: user,
  roomName: string,
): Promise<{ message: string; error: boolean; roomId?: string }> => {
  try {
    const roomsCreatedByUser = await prisma.room.findMany({
      where: { creator_id: user.id },
      select: { id: true },
    });
    if (roomsCreatedByUser.length >= 5)
      return {
        message: 'You have already created 5 rooms, delete some rooms first',
        error: true,
      };
    const room = await prisma.room.create({
      data: { creator_id: user.id, name: roomName },
    });
    return { message: 'Success', error: false, roomId: room.id };
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return {
          message: 'Room with this name is already registered',
          error: true,
        };
    }
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
    const isUserInRoomOrAdmin = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { rooms: { some: { id: { equals: roomId } } } },
          {
            rooms_created: {
              some: {
                id: { equals: roomId },
              },
            },
          },
        ],
      },
      select: { id: true },
    });
    if (!isUserInRoomOrAdmin)
      return {
        message: 'You might not have joined the room, or no such room exists',
        roomInfo: null,
        error: true,
      };
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

const joinRoom = async (
  userId: string,
  roomName: string,
): Promise<{ message: string; error: boolean; roomId?: string }> => {
  try {
    const room = await prisma.room.update({
      where: { name: roomName },
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return { message: 'Success', error: false, roomId: room.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2016')
        return { message: 'No such room exists', error: true };
    }
    return {
      message: 'An error occured while processing your request',
      error: true,
    };
  }
};

export default { createRoom, getRoomInfo, joinRoom };
