// define numbers as strings too.
export default {
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000/',
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  CLIENT_URL: process.env.CLIENT_URL,
  SOCKET_TOKEN_SECRET:
    process.env.SOCKET_TOKEN_SECRET || 'ljkhsaduhntolika89yvsdnlke480',
  TOKEN_VALIDITY_MINUTES: process.env.TOKEN_VALIDITY_MINUTES || '15',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'aohg08neorh8094nyoirgaehol',
  REFRESH_TOKEN_VALIDITY_DAYS: process.env.REFRESH_TOKEN_VALIDITY_DAYS || '2',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || 'asdjfuioh809jh2yionaer89nvadsol',
};
