/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import UserService from '../services/UserService/index';
import logger from '../util/logger';

const dashBoardInfo = async (req: Request, res: Response) => {
  try {
    const response = await UserService.profile.dashBoardInfo(
      req.user?.id as string,
    );
    return res.json(response);
  } catch (error) {
    logger.log('error', 'profilecontroller:dashboardinfo %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

const pollsCreated = async (req: Request, res: Response) => {
  try {
    const sortBy = req.query?.sortBy === 'popular' ? 'popular' : 'recent';
    const response = await UserService.profile.pollsCreated(
      req.user?.id as string,
      sortBy,
    );
    return res.json(response);
  } catch (error) {
    logger.log('error', 'profilecontroller:pollscreated %O', error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

export default { dashBoardInfo, pollsCreated };
