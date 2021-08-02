/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';
import UserService from '../services/UserService/index';

const dashBoardInfo = async (req: Request, res: Response) => {
  try {
    const response = await UserService.profile.dashBoardInfo(
      req.user?.id as string,
    );
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json({
      message: 'An error occured while processing your request',
      error: true,
    });
  }
};

export default { dashBoardInfo };
