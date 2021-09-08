import prisma from '../../prismaClient';
import PollService from '../PollService';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('createPoll: Used for creating polls through websockets', () => {
  test('User cannot create a poll unless he is admin of the room', async () => {
    const username = 'randomuseriom4w90j',
      email = 'randomnfaino@test.com',
      password = '123456',
      roomName = 'testroomrandom2905uw';
    const data = await prisma.user.create({
      data: {
        email,
        username,
        encrypted_password: password,
        provider: 'EMAIL',
        rooms_created: { create: [{ name: roomName }] },
      },
      include: { rooms_created: true },
    });
    // Provide a different username
    let response = await PollService.createPoll(
      'wrongusername',
      data.rooms_created[0].id,
      'Test question',
      [
        { option_text: '1' },
        { option_text: '2' },
        { option_text: '3' },
        { option_text: '4' },
      ],
    );
    expect(response.poll).toBeNull();
    expect(response.message).toBe(
      'You are not authorized to create polls in this room',
    );

    response = await PollService.createPoll(
      data.id,
      data.rooms_created[0].id,
      'Test question',
      [
        { option_text: '1' },
        { option_text: '2' },
        { option_text: '3' },
        { option_text: '4' },
      ],
    );
    expect(response.poll).not.toBeNull();
    expect(response.message).toBe('Poll Created successfully');
    //   Cleanup
    await prisma.option.deleteMany({
      where: { poll_id: response.poll?.id },
    });
    await prisma.poll.deleteMany({
      where: { id: response.poll?.id },
    });
    await prisma.room.deleteMany({ where: { creator: { username } } });
    await prisma.user.delete({ where: { username } });
  });
});
