import { S3Client } from '@aws-sdk/client-s3';
import { CLOUDFLARE } from '../constants';

export const getS3Client = (): S3Client => {
  return new S3Client({
    region: 'auto',
    endpoint: CLOUDFLARE.ENDPOINT as string,
    credentials: {
      accessKeyId: CLOUDFLARE.ACCESS_KEY_ID as string,
      secretAccessKey: CLOUDFLARE.SECRET_ACCESS_KEY as string,
    },
    forcePathStyle: true,
  });
};
