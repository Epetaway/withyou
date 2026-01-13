import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { env } from '../config/env.js';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!env.awsAccessKeyId || !env.awsSecretAccessKey) {
      throw new Error('AWS credentials are not configured');
    }
    
    s3Client = new S3Client({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      },
    });
  }
  return s3Client;
}

export interface PresignedPostData {
  uploadUrl: string;
  fields: Record<string, string>;
  avatarUrl: string;
}

export async function generateAvatarUploadUrl(
  userId: string,
  fileType: string
): Promise<PresignedPostData> {
  if (!env.s3BucketName) {
    throw new Error('S3 bucket is not configured');
  }

  const client = getS3Client();
  const timestamp = Date.now();
  const extension = fileType.split('/')[1] || 'jpg';
  const key = `avatars/${userId}/${timestamp}.${extension}`;

  const { url, fields } = await createPresignedPost(client, {
    Bucket: env.s3BucketName,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 5 * 1024 * 1024], // 5MB max
      ['starts-with', '$Content-Type', 'image/'],
    ],
    Fields: {
      'Content-Type': fileType,
    },
    Expires: 3600, // 1 hour
  });

  const avatarUrl = env.cloudfrontDomain
    ? `https://${env.cloudfrontDomain}/${key}`
    : `https://${env.s3BucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`;

  return {
    uploadUrl: url,
    fields,
    avatarUrl,
  };
}
