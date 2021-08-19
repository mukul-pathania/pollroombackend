/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import { user } from '@prisma/client';
import PollRoomService from '../services/PollRoomService/index';
import logger from '../util/logger';

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
    logger.log('error', 'roomcontroller:createroom %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

const getRoomInfo = async (req: Request, res: Response) => {
  try {
    const { id: roomId } = req.params;
    if (!roomId) return res.json({ message: 'Provide a room id', error: true });
    const response = await PollRoomService.getRoomInfo(
      req.user?.id as string,
      roomId,
    );
    return res.json(response);
  } catch (error) {
    logger.log('error', 'roomcontroller:getroominfo %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomName } = req.body;
    const user = req.user;
    if (!roomName)
      return res.json({ message: 'roomName is not provided', error: true });
    const response = await PollRoomService.joinRoom(
      user?.id as string,
      roomName,
    );
    return res.json(response);
  } catch (error) {
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

export default { createRoom, getRoomInfo, joinRoom };
