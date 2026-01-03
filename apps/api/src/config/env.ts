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
};
