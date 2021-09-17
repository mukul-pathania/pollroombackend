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
beforeAll(() => {
  server = startServer();
  axiosAPIClient = axios.create({
    baseURL: `http://127.0.0.1:${42272}`,
    validateStatus: () => true,
  });

  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(async () => {
  server.close();
  nock.enableNetConnect();
  await prisma.$disconnect();
});

describe('User routes', () => {
  describe('GET /user/dashboard', () => {
    test('The dashboard is a protected route', async () => {
      // Act
      const dashboardInfo = await axiosAPIClient.get('/user/dashboard');
      // Assert
      expect(dashboardInfo.status).toBe(401);
      expect(dashboardInfo.data).toStrictEqual({
        error: true,
        message: 'No auth token',
      });
    });

    test("Newly created user will see all 0's as response", async () => {
      // Arrange
      const email = 'DashboardUser@test.com';
      const password = '123456';
      // Create the user if it does not exist
      await axiosAPIClient.post('/auth/signup', {
        email,
        password,
        username: 'DashboardUser123456',
      });
      // Make the email to be verified so we can login
      await prisma.user.update({
        where: { email },
        data: { confirmed_at: new Date(), confirmation_token: '' },
      });
      const response = await axiosAPIClient.post('/auth/login', {
        email,
        password,
      });
      expect(response.status).toBe(200);
      const { token } = response.data;
      expect(token).toBeDefined();
      axiosAPIClient.defaults.headers.Authorization = `Bearer ${token}`;

      // Act
      const dashboardInfo = await axiosAPIClient.get('/user/dashboard');

      // Assert
      expect(dashboardInfo.status).toBe(200);
      expect(dashboardInfo.data).toStrictEqual({
        createdRooms: [],
        error: false,
        message: 'Success',
        roomsJoined: 0,
        votesCasted: 0,
        pollsCreated: 0,
      });
    });

    test('Returns the correct number of rooms joined', async () => {
      // Arrange
      const email1 = 'DashboardUser2@test.com',
        email2 = 'DashboardUser3@test.com',
        password = '123456';
      await axiosAPIClient.post('/auth/signup', {
        email: email1,
        password,
        username: 'DashboardUser2',
      });

      await axiosAPIClient.post('/auth/signup', {
        email: email2,
        password,
        username: 'DashboardUser3',
      });
      await prisma.user.updateMany({
        where: { email: { contains: 'DashboardUser' } },
        data: { confirmed_at: new Date(), confirmation_token: '' },
      });
      const response = await axiosAPIClient.post('/auth/login', {
        email: email1,
        password,
      });
      const { token } = response.data;
      axiosAPIClient.defaults.headers.Authorization = `Bearer ${token}`;
      const roomCount = Math.floor(Math.random() * 5 + 1);

      // Create some rooms with user 1 as admin
      await (async function loop() {
        for (let i = 0; i < roomCount; i++) {
          await axiosAPIClient.post('/room/new', {
            roomName: `roomNumber${i + 1}`,
          });
        }
      })();
      const response2 = await axiosAPIClient.post('/auth/login', {
        email: email2,
        password,
      });
      const { token: token2 } = response2.data;
      axiosAPIClient.defaults.headers.Authorization = `Bearer ${token2}`;
      await (async function loop() {
        for (let i = 0; i < roomCount; i++) {
          await axiosAPIClient.post('/room/join', {
            roomName: `roomNumber${i + 1}`,
          });
        }
      })();

      // Act
      const dashboardInfo = await axiosAPIClient.get('/user/dashboard');

      // Assert
      expect(dashboardInfo.status).toBe(200);
      expect(dashboardInfo.data).toStrictEqual({
        createdRooms: [],
        error: false,
        message: 'Success',
        roomsJoined: roomCount,
        votesCasted: 0,
        pollsCreated: 0,
      });

      // Cleanup so the next run of this test works
      await prisma.room.deleteMany({ where: { creator: { email: email1 } } });
    }, 20000);

    test.todo('Returns the correct number of votes casted');
    test.todo('Return the correct number of polls created');
  });
});
