import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file if present
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1024).max(65535).default(3001),
  DATABASE_URL: z.string().url().refine(
    (url) => url.startsWith('postgres://') || url.startsWith('postgresql://'),
    { message: 'Must be a valid PostgreSQL connection string' }
  ),
  REDIS_URL: z.string().url().refine(
    (url) => url.startsWith('redis://') || url.startsWith('rediss://'),
    { message: 'Must be a valid Redis URL' }
  ),
  JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required'),
  JWT_ACCESS_EXPIRATION: z.string().regex(/^[0-9]+[mhd]$/, 'Must be a valid duration (e.g. 15m, 1h)'),
  JWT_REFRESH_EXPIRATION: z.string().regex(/^[0-9]+[mhd]$/, 'Must be a valid duration (e.g. 7d, 30d)'),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USERNAME: z.string().min(1, 'SMTP_USERNAME is required'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug']).default('info'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000').transform((val) => val.split(',').map((s) => s.trim())),
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

const parsedConfig = validateEnv();

export const config = Object.freeze({
  env: parsedConfig.NODE_ENV,
  port: parsedConfig.PORT,
  databaseUrl: parsedConfig.DATABASE_URL,
  redisUrl: parsedConfig.REDIS_URL,
  jwt: {
    privateKey: parsedConfig.JWT_PRIVATE_KEY,
    accessExpiration: parsedConfig.JWT_ACCESS_EXPIRATION,
    refreshExpiration: parsedConfig.JWT_REFRESH_EXPIRATION,
  },
  smtp: {
    host: parsedConfig.SMTP_HOST,
    port: parsedConfig.SMTP_PORT,
    username: parsedConfig.SMTP_USERNAME,
    password: parsedConfig.SMTP_PASSWORD,
  },
  logLevel: parsedConfig.LOG_LEVEL,
  corsAllowedOrigins: parsedConfig.CORS_ALLOWED_ORIGINS,
});
