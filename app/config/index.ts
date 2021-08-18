export default {
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000/',
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    'dsoheihisuy098njoietrwa9890er98u4qklnfdas08j0',
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  CLIENT_URL: process.env.CLIENT_URL,
  SOCKET_TOKEN_SECRET:
    process.env.SOCKET_TOKEN_SECRET || 'ljkhsaduhntolika89yvsdnlke480',
};
