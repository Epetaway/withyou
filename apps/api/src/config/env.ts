import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const env = {
  port: parsePort(process.env.PORT) ?? 3000,
  jwtSecret: process.env.JWT_SECRET ?? 'replace-me-in-prod',
  
  // OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  appleClientId: process.env.APPLE_CLIENT_ID,
  appleTeamId: process.env.APPLE_TEAM_ID,
  appleKeyId: process.env.APPLE_KEY_ID,
  applePrivateKey: process.env.APPLE_PRIVATE_KEY,
  
  // AWS SES
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sesFromEmail: process.env.SES_FROM_EMAIL ?? 'noreply@withyou.app',
  
  // AWS S3
  s3BucketName: process.env.S3_BUCKET_NAME,
  cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN,
  
  // Deep linking
  appDeepLinkDomain: process.env.APP_DEEP_LINK_DOMAIN ?? 'withyou.app',
};
