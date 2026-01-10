import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../config/cloudflare';
import { CLOUDFLARE } from '../constants';

export const cloudflare = {
  uploadFile,
  deleteFile,
};

async function uploadFile(animalUuid: string, file: Express.Multer.File): Promise<string> {
  const s3Client = getS3Client();
  const fileName = `${animalUuid}/${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: CLOUDFLARE.BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    throw new Error(`Failed to upload file to Cloudflare R2: ${error.message}`);
  }

  return `${CLOUDFLARE.PUBLIC_URL}/${fileName}`;
}

async function deleteFile(fileUrl: string): Promise<void> {
  const s3Client = getS3Client();
  const fileName = fileUrl.replace(`${CLOUDFLARE.PUBLIC_URL}/`, '');

  const command = new DeleteObjectCommand({
    Bucket: CLOUDFLARE.BUCKET_NAME,
    Key: fileName,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    throw new Error(`Failed to delete file from Cloudflare R2: ${error.message}`);
  }
}
