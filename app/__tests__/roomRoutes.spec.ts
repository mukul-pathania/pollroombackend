import axios, { AxiosInstance } from 'axios';
import { Server } from 'http';
import nock from 'nock';
import { startServer } from '..';
import prisma from '../prismaClient';

// startServer will use this config, just change the port

jest.mock('../config', () => ({
  ...jest.requireActual('../config').default,
  PORT: '42272',
}));

jest.mock('../services/EmailService', () => ({
  ...jest.requireActual('../services/EmailService').default,
  sendSignUpEmail: jest.fn(),
}));

let server: Server, axiosAPIClient: AxiosInstance;
const email = 'roomCreator@test.com',
  password = '123456';

beforeAll(async () => {
  server = startServer();
  axiosAPIClient = axios.create({
    baseURL: `http://127.0.0.1:${42272}`,
    validateStatus: () => true,
  });

  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
  await axiosAPIClient.post('/auth/signup', {
    email,
    password,
    username: 'roomCreator1',
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
  axiosAPIClient.defaults.headers.Authorization = `Bearer ${token}`;
});

afterAll(async () => {
  server.close();
  nock.enableNetConnect();
  await prisma.room.deleteMany({ where: { creator: { email: email } } });
  await prisma.user.delete({ where: { email: email } });
  await prisma.$disconnect();
});

describe('Room routes', () => {
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
  });
});
