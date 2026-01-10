import { ConfigModuleOptions } from '@nestjs/config';
import { z } from 'zod';
import { Environment } from '../utils';

const environments = Object.values(Environment) as [string, ...string[]];

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(environments),
  PORT: z.coerce.number().default(3000),

  // Database
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),

  // Keys
  JWT_SECRET_KEY: z.string(),

  // Google Calendar
  GOOGLE_CALENDAR_ID: z.string(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string(),

  // Cloudflare
  CLOUDFLARE_ENDPOINT: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
});

const validate = (config: Record<string, string>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    console.error('❌ Invalid environment variables:', tree);
    throw new Error('Invalid environment variables');
  }

  return result.data;
};

export const envConfig: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  envFilePath: ['.env', '.env.local', '.env.dev', '.env.hml', '.env.prd'],
  validate,
};
