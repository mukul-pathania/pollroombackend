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
        message: 'This endpoint requires authentication',
      });
    });
  });
});
