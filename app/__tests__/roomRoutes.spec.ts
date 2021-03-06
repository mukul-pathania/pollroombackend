import axios, { AxiosInstance } from 'axios';
import { Server } from 'http';
import nock from 'nock';
import { startServer } from '..';
import prisma from '../prismaClient';

// startServer will use this config, just change the port

jest.mock('../config', () => ({
  ...jest.requireActual('../config').default,
  PORT: '42274',
}));

jest.mock('../services/EmailService', () => ({
  ...jest.requireActual('../services/EmailService').default,
  sendSignUpEmail: jest.fn(),
}));

let server: Server, axiosAPIClient: AxiosInstance, authToken: string;
const email = 'roomCreator@test.com',
  password = '123456',
  username = 'roomCretor1';

beforeAll(async () => {
  server = startServer();
  axiosAPIClient = axios.create({
    baseURL: `http://127.0.0.1:${42274}`,
    validateStatus: () => true,
  });

  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
  await axiosAPIClient.post('/auth/signup', {
    email,
    password,
    username,
  });
  await prisma.user.update({
    where: { email: email },
    data: { confirmed_at: new Date(), confirmation_token: '' },
  });
  const authResponse = await axiosAPIClient.post('/auth/login', {
    email,
    password,
  });
  const { token } = authResponse.data;
  authToken = `Bearer ${token}`;
  axiosAPIClient.defaults.headers.Authorization = authToken;
});

afterAll(async () => {
  server.close();
  nock.enableNetConnect();
  await prisma.room.deleteMany({ where: { creator: { email: email } } });
  await prisma.user.delete({ where: { email: email } });
  await prisma.$disconnect();
});

describe('Room routes', () => {
  beforeEach(() => {
    axiosAPIClient.defaults.headers.Authorization = authToken;
  });
  describe('POST /room/new', () => {
    test('Proper message is returned when roomName is not provided', async () => {
      const response = await axiosAPIClient.post('/room/new', {});
      expect(response.data).toStrictEqual({
        error: true,
        message: 'roomName is not provided',
      });
    });

    test('RoomId is returned on creation of room', async () => {
      const roomName = 'Integration room1';
      // Act
      const response = await axiosAPIClient.post('/room/new', {
        roomName,
      });

      // Assert
      expect(response.status).toBe(200);
      expect(response.data.roomId).toBeDefined();

      // Cleanup
      await prisma.room.delete({ where: { name: roomName } });
    });

    test('Proper response is generated when roomName is not unique', async () => {
      const roomName = 'Very unique name';
      // Arrange
      const response1 = await axiosAPIClient.post('/room/new', { roomName });
      expect(response1.status).toBe(200);

      // Act
      const response2 = await axiosAPIClient.post('/room/new', { roomName });
      expect(response2.data).toStrictEqual({
        message: 'Room with this name is already registered',
        error: true,
      });

      // Cleanup
      await prisma.room.delete({ where: { name: roomName } });
    });

    test('A user cannot create more than 5 rooms', async () => {
      const roomName = 'integrationRoom';
      await (async function loop() {
        for (let i = 0; i < 5; i++) {
          await axiosAPIClient.post('/room/new', {
            roomName: `${roomName}${i + 1}`,
          });
        }
      })();
      const response = await axiosAPIClient.post('/room/new', {
        roomName: 'integration room 10000',
      });

      // Assert
      expect(response.data).toStrictEqual({
        message: 'You have already created 5 rooms, delete some rooms first',
        error: true,
      });

      // Cleanup
      await prisma.room.deleteMany({
        where: { name: { contains: roomName } },
      });
    });

    test('User needs to be authenticated to access this route', async () => {
      axiosAPIClient.defaults.headers.Authorization = '';
      const response = await axiosAPIClient.post('/room/new', {
        roomName: 'testroom',
      });
      expect(response.status).toBe(401);
      expect(response.data).toStrictEqual({
        error: true,
        message: 'No auth token',
      });
    });

    test.todo('Correct status codes are returned in all cases');
  });

  describe('POST /room/join', () => {
    test('User needs to be authenticated to access this route', async () => {
      axiosAPIClient.defaults.headers.Authorization = '';
      const response = await axiosAPIClient.post('/room/join', {
        roomName: 'This value should not matter',
      });
      expect(response.status).toBe(401);
      expect(response.data).toStrictEqual({
        error: true,
        message: 'No auth token',
      });
    });

    test('Proper response is generated when roomName is not provided', async () => {
      const response = await axiosAPIClient.post('/room/join');
      expect(response.data).toStrictEqual({
        message: 'roomName is not provided',
        error: true,
      });
    });

    test('Proper response is generated when roomName provided does not exist', async () => {
      const roomName = 'doiexist'; //Do I exist?
      prisma.room.delete({ where: { name: roomName } });

      const response = await axiosAPIClient.post('/room/join', { roomName });
      expect(response.data).toStrictEqual({
        message: 'No such room exists',
        error: true,
      });
    });

    test.todo(
      'Users should not be able to join rooms where they are the creator/admin',
    );

    test('RoomId is returned when we join a room successfully', async () => {
      const roomName = 'RoomJustCreated',
        email = 'RoomJustCreatedCreator@test.com',
        password = '123456',
        header = axiosAPIClient.defaults.headers.Authorization;
      await axiosAPIClient.post('/auth/signup', {
        email,
        password,
        username: 'RoomJustCreatedCreator',
      });
      await prisma.user.update({
        where: { email: email },
        data: { confirmed_at: new Date(), confirmation_token: '' },
      });
      const {
        data: { token },
      } = await axiosAPIClient.post('/auth/login', { email, password });
      axiosAPIClient.defaults.headers.Authorization = `Bearer ${token}`;
      await axiosAPIClient.post('/room/new', { roomName });

      // Act
      axiosAPIClient.defaults.headers.Authorization = header;
      const response = await axiosAPIClient.post('/room/join', { roomName });

      // Assert
      expect(response.data).toMatchObject({ error: false, message: 'Success' });
      expect(response.data.roomId).toBeDefined();
    });

    test.todo('Correct status codes are returned in all cases');
  });

  describe('GET /room/:id', () => {
    test('User needs to be authenticated to access this route', async () => {
      axiosAPIClient.defaults.headers.Authorization = '';
      const roomId = '123456';
      const response = await axiosAPIClient.get(`/room/${roomId}`);
      expect(response.status).toBe(401);
      expect(response.data).toStrictEqual({
        error: true,
        message: 'No auth token',
      });
    });

    test('A user will get proper error message if he has not joined the room', async () => {
      const roomName = 'RoomJustCreated12345',
        email = 'RoomJustCreatedCreator12345@test.com',
        password = '123456',
        header = axiosAPIClient.defaults.headers.Authorization;

      axiosAPIClient.defaults.headers.Authorization = '';

      await axiosAPIClient.post('/auth/signup', {
        email,
        password,
        username: 'RoomJustCreatedCreator23456',
      });
      await prisma.user.update({
        where: { email: email },
        data: { confirmed_at: new Date(), confirmation_token: '' },
      });
      const {
        data: { token },
      } = await axiosAPIClient.post('/auth/login', { email, password });
      axiosAPIClient.defaults.headers.Authorization = `Bearer ${token}`;

      const roomCreationResponse = await axiosAPIClient.post('/room/new', {
        roomName,
      });

      axiosAPIClient.defaults.headers.Authorization = header;
      const testResponse = await axiosAPIClient.get(
        `/room/${roomCreationResponse.data.roomId}`,
      );
      expect(testResponse.data.error).toBe(true);
      expect(testResponse.data.roomInfo).toBeNull();
      expect(testResponse.data.message).toBe(
        'You might not have joined the room, or no such room exists',
      );

      // Cleanup
      await prisma.room.delete({ where: { name: roomName } });
    });

    test('Socket token is provided with the response, it will be used for socketio connection', async () => {
      const roomName = 'RandomName094908u4390';
      const {
        data: { roomId },
      } = await axiosAPIClient.post('/room/new', { roomName });
      const response = await axiosAPIClient.get(`/room/${roomId}`);
      expect(response.data.socketToken).toBeDefined();
      expect(response.data.socketToken).not.toBeNull();

      // Cleanup
      prisma.room.delete({ where: { name: roomName } });
    });

    test('Information of the creator of room, time of creation is returned in response', async () => {
      const roomName = 'uniquename9090j2opg';
      const {
        data: { roomId },
      } = await axiosAPIClient.post('/room/new', { roomName });
      const response = await axiosAPIClient.get(`/room/${roomId}`);
      expect(response.data.roomInfo.creator.username).toBe(username);
      expect(response.data.roomInfo.created_at).toBeDefined();
      expect(response.data.roomInfo.created_at).not.toBeNull();

      // Cleanup
      prisma.room.delete({ where: { name: roomName } });
    });

    test('Polls created in this room are returned in response', async () => {
      const roomName = 'randomname290jhweiklmearf';
      const {
        data: { roomId },
      } = await axiosAPIClient.post('/room/new', { roomName });
      const response = await axiosAPIClient.get(`/room/${roomId}`);
      expect(response.data.roomInfo.polls).toBeDefined();
    });

    test.todo('Correct status codes are returned in all cases');

    // Cleanup
  });
});
