export const DATABASE = {
  HOST: process.env.DB_HOST as string,
  PORT: Number(process.env.DB_PORT) || 5432,
  USERNAME: process.env.DB_USERNAME as string,
  PASSWORD: process.env.DB_PASSWORD as string,
  NAME: process.env.DB_NAME as string,
  SCHEMA: process.env.DB_SCHEMA,
} as const;
