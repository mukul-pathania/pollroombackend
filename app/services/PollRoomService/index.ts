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

export default { createRoom };
