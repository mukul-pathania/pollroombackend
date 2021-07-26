export default {
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    'dsoheihisuy098njoietrwa9890er98u4qklnfdas08j0',
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_SECRET_ID: process.env.GOOGLE_SECRET_ID as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  CLIENT_URL: process.env.CLIENT_URL,
};
