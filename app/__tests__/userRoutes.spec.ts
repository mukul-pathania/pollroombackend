import axios, { AxiosInstance } from 'axios';
import { Server } from 'http';
import nock from 'nock';
import { startServer } from '..';

// startServer will use this config, just change the port
jest.mock('../config', () => ({
  ...jest.requireActual('../config').default,
  PORT: '42272',
}));

let server: Server, axiosAPIClient: AxiosInstance;
beforeAll((done) => {
  server = startServer();
  axiosAPIClient = axios.create({
    baseURL: `http://127.0.0.1:${42272}`,
    validateStatus: () => true,
  });

  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
  done();
});

afterAll((done) => {
  // ️️️✅ Best Practice: Clean-up resources after each run
  server.close();

  // ️️️✅ Best Practice: Clean-up all nocks before the next file starts
  nock.enableNetConnect();
  done();
});

describe('User routes', () => {
  describe('GET /user/dashboard', () => {
    test('The dashboard is a protected route', async () => {
      const dashboardInfo = await axiosAPIClient('/user/dashboard');
      expect(dashboardInfo.status).toBe(401);
    });
  });
});
