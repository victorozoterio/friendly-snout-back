import { S3Client } from '@aws-sdk/client-s3';
import { CLOUDFLARE } from '../constants/cloudflare.constants';

export const getS3Client = (): S3Client => {
  return new S3Client({
    region: 'auto',
    endpoint: CLOUDFLARE.ENDPOINT,
    credentials: {
      accessKeyId: CLOUDFLARE.ACCESS_KEY_ID,
      secretAccessKey: CLOUDFLARE.SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
};
