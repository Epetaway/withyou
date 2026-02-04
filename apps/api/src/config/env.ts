import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment-specific .env file
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(__dirname, '../../', envFile);

// Try to load environment-specific file first, fallback to .env
dotenv.config({ path: envPath });
dotenv.config(); // Fallback to .env if exists

const parsePort = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseAllowedOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split(',').map(origin => origin.trim()).filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appEnv: process.env.APP_ENV ?? 'development',
  port: parsePort(process.env.PORT) ?? 3000,
  jwtSecret: process.env.JWT_SECRET ?? 'replace-me-in-prod',
  
  // QA Admin
  qaAdminToken: process.env.QA_ADMIN_TOKEN,
  
  // CORS
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  
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
  
  // Helper methods
  isDevelopment: () => env.nodeEnv === 'development' || env.appEnv === 'development',
  isTest: () => env.nodeEnv === 'test' || env.appEnv === 'test',
  isProduction: () => env.nodeEnv === 'production' || env.appEnv === 'production',
};
