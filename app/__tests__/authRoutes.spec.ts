import axios, { AxiosInstance } from 'axios';
import { Server } from 'http';
import nock from 'nock';
import { startServer } from '..';
import prisma from '../prismaClient';
import EmailService from '../services/EmailService';
import bcrypt from 'bcrypt';
// startServer will use this config, just change the port

jest.mock('../config', () => ({
  ...jest.requireActual('../config').default,
  PORT: '42275',
}));

jest.mock('../services/EmailService', () => ({
  ...jest.requireActual('../services/EmailService').default,
  sendSignUpEmail: jest.fn(),
}));

let server: Server, axiosAPIClient: AxiosInstance;
beforeAll(() => {
  server = startServer();
  axiosAPIClient = axios.create({
    baseURL: `http://127.0.0.1:42275`,
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

describe('Auth routes', () => {
  describe('POST /auth/signup', () => {
    test.todo('Correct status codes are returned in all cases');
    test('Username, email and password are required parameters to create a account', async () => {
      const username = 'someuniquename12349875',
        email = 'authIntegrationTest@test.com',
        password = '123456';
      const response1 = await axiosAPIClient.post('/auth/signup', { username });
      expect(response1.data).toStrictEqual({
        error: true,
        message: 'Please provide all three of username, email and password',
      });
      const response2 = await axiosAPIClient.post('/auth/signup', { email });
      expect(response2.data).toStrictEqual({
        error: true,
        message: 'Please provide all three of username, email and password',
      });
      const response3 = await axiosAPIClient.post('/auth/signup', { password });
      expect(response3.data).toStrictEqual({
        error: true,
        message: 'Please provide all three of username, email and password',
      });
    });

    test('Username must have length of atleast 4', async () => {
      const username = '123',
        email = 'authIntegrationTest@test.com',
        password = '123456';
      const response = await axiosAPIClient.post('/auth/signup', {
        username,
        email,
        password,
      });
      expect(response.data).toStrictEqual({
        error: true,
        message: 'Username must contain atleast 4 characters',
      });
    });

    test('Password must have length greater than 6', async () => {
      const username = 'IntegrationUniqueUser123483htwe',
        email = 'test8945y834957934iorfkrlf@test.com',
        password = '12345';
      const response = await axiosAPIClient.post('/auth/signup', {
        username,
        email,
        password,
      });
      expect(response.data).toStrictEqual({
        error: true,
        message: 'Password must be atleast 6 characters',
      });
    });

    test('All of username, password, email must not be greater than 40 characters ', async () => {
      const username = 'IntegrationTest1234',
        email = 'test@test.com',
        password = '123456',
        longEmail = '1234567890123456789012345678901234567890@email.com',
        longUsername = '1234567890123456789012345678901234567890testUser',
        longPassword = '1234567890123456789012345678901234567890123456789';
      const response1 = await axiosAPIClient.post('/auth/signup', {
        username: longUsername,
        email,
        password,
      });
      const response2 = await axiosAPIClient.post('/auth/signup', {
        username,
        email: longEmail,
        password,
      });
      const response3 = await axiosAPIClient.post('/auth/signup', {
        username,
        email,
        password: longPassword,
      });
      expect(response1.data).toStrictEqual({
        message: 'No field should have length greater than 40',
        error: true,
      });
      expect(response2.data).toStrictEqual({
        message: 'No field should have length greater than 40',
        error: true,
      });
      expect(response3.data).toStrictEqual({
        message: 'No field should have length greater than 40',
        error: true,
      });
    });

    test("We send email to verify user's email on signup", async () => {
      const email = 'veryuniqueemail@test.com';
      await axiosAPIClient.post('/auth/signup', {
        email,
        password: '123456',
        username: 'veryuniqueusername1234890sdfl',
      });
      const user = await prisma.user.findFirst({ where: { email } });
      expect(EmailService.sendSignUpEmail).toHaveBeenLastCalledWith(user);

      //   Cleanup
      await prisma.user.delete({ where: { email: email } });
    });
  });

  describe('POST /auth/login', () => {
    test.todo('Correct status codes are returned in all cases');
    test('Proper message is returned when required credentials are not provided', async () => {
      const response1 = await axiosAPIClient.post('/auth/login', {
        email: 'test@test.com',
      });
      const response2 = await axiosAPIClient.post('/auth/login', {
        password: '123456',
      });
      expect(response1.data).toStrictEqual({
        message: 'Missing credentials',
        error: true,
      });
      expect(response2.data).toStrictEqual({
        message: 'Missing credentials',
        error: true,
      });
    });

    test('Proper message is returned if the account was registered using Google/Github or some other way', async () => {
      const email = 'integrationTest@test.com',
        username = 'uonieg8ijwklahmnawe80j',
        password = '123456',
        encrypted_password = await bcrypt.hash(password, 15);
      await prisma.user.create({
        data: {
          email,
          encrypted_password,
          username,
          provider: 'GOOGLE',
        },
      });

      const response = await axiosAPIClient.post('/auth/login', {
        email,
        password: '123456',
      });
      expect(response.data).toStrictEqual({
        message: 'Your account was registered using Google',
        error: true,
      });

      //   Cleanup
      await prisma.user.delete({ where: { email } });
    });

    test('Proper message is generated if the user is not found or password is incorrect', async () => {
      const username = 'idonotexistyet',
        email = 'idonotexistyet@test.com',
        password = '123456';
      const response1 = await axiosAPIClient.post('/auth/login', {
        email,
        password,
      });
      expect(response1.data).toStrictEqual({
        message: 'Incorrect username or password',
        error: true,
      });
      await axiosAPIClient.post('/auth/signup', { email, password, username });
      await prisma.user.update({
        where: { email },
        data: { confirmed_at: new Date(), confirmation_token: '' },
      });
      //   provide wrong password
      const response2 = await axiosAPIClient.post('/auth/login', {
        email,
        password: '12345678',
      });
      expect(response2.data).toStrictEqual({
        message: 'Incorrect username or password',
        error: true,
      });

      const response3 = await axiosAPIClient.post('/auth/login', {
        email,
        password,
      });
      expect(response3.data.error).toBe(false);

      //   cleanup
      await prisma.user.delete({ where: { email } });
    }, 10000);

    test('User needs to verify their email before they are allowed to log in', async () => {
      const username = 'someuniquename90j42pim',
        email = 'someuniqueusername093t290g',
        password = '123456';
      await axiosAPIClient.post('/auth/signup', { email, username, password });
      const response = await axiosAPIClient.post('/auth/login', {
        email,
        password,
      });
      expect(response.data).toStrictEqual({
        message: 'Verify your email before logging in',
        error: true,
      });

      //   Cleanup
      await prisma.user.delete({ where: { username } });
    });
  });
});
