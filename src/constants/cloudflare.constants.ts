import { Environment } from 'src/utils';

const isDev = process.env.NODE_ENV === Environment.DEV;

export const CLOUDFLARE = {
  BUCKET_NAME: isDev ? 'friendly-snout-dev' : 'friendly-snout',
  ENDPOINT: process.env.CLOUDFLARE_ENDPOINT as string,
  ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID as string,
  SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string,
  PUBLIC_URL: process.env.CLOUDFLARE_PUBLIC_URL as string,
} as const;
