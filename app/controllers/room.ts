/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import { user } from '@prisma/client';
import PollRoomService from '../services/PollRoomService/index';

const createRoom = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { roomName } = req.body;
    if (!user)
      return res.json({ message: 'User is not authenticated', error: true });
    if (!roomName)
      return res.json({ message: 'roomName is not provided', error: true });
    const response = await PollRoomService.createRoom(user as user, roomName);
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

export default { createRoom };
