import { ConfigModuleOptions } from '@nestjs/config';
import { Environment } from '../utils';
import { z } from 'zod';

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
