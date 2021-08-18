import prisma from '../../prismaClient';

const dashBoardInfo = async (
  userId: string,
): Promise<{
  error: boolean;
  message: string;
  roomsJoined: number;
  pollsCreated: number;
  votesCasted: number;
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
    const pollsCreated = user?.rooms_created.reduce((result, item) => {
      return result + item.polls.length;
    }, 0);
    return {
      message: 'Success',
      error: false,
      roomsJoined: user?.rooms.length || 0,
      votesCasted: user?.votes.length || 0,
      pollsCreated: pollsCreated || 0,
    };
  } catch (error) {
    console.log(error);
    return {
      message: 'An error occured while processing your request',
      error: true,
      roomsJoined: 0,
      votesCasted: 0,
      pollsCreated: 0,
    };
  }
};

export default { dashBoardInfo };
