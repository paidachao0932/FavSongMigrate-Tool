export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '0.0.0.0',
  clientDistPath: process.env.CLIENT_DIST || '../client/dist',
  isDev: process.env.NODE_ENV !== 'production',
};
