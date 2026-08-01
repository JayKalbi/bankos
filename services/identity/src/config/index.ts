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
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(100).optional(),
  REDIS_URL: z.string().url().refine(
    (url) => url.startsWith('redis://') || url.startsWith('rediss://'),
    { message: 'Must be a valid Redis URL' }
  ),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().min(100).default(5000),
  REDIS_MAX_RETRIES: z.coerce.number().int().min(0).default(5),
  REDIS_KEY_PREFIX: z.string().default('bankos:id:'),
  JWT_ACTIVE_KEY_ID: z.string().min(1, 'JWT_ACTIVE_KEY_ID is required'),
  JWT_KEYS: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      const schema = z.record(z.string(), z.object({
        privateKey: z.string().optional(),
        publicKey: z.string()
      }));
      return schema.parse(parsed);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_KEYS must be a valid JSON string mapping kid to { publicKey, privateKey }',
      });
      return z.NEVER;
    }
  }),
  JWT_ACCESS_EXPIRATION: z.string().regex(/^[0-9]+[mhd]$/, 'Must be a valid duration (e.g. 15m, 1h)'),
  JWT_REFRESH_EXPIRATION: z.string().regex(/^[0-9]+[mhd]$/, 'Must be a valid duration (e.g. 7d, 30d)'),
  JWT_ISSUER: z.string().default('bankos:identity'),
  JWT_AUDIENCE: z.string().default('bankos:gateway'),
  ARGON2_MEMORY_COST: z.coerce.number().int().min(1024).default(65536),
  ARGON2_TIME_COST: z.coerce.number().int().min(1).default(3),
  ARGON2_PARALLELISM: z.coerce.number().int().min(1).default(4),
  PASSWORD_PEPPER: z.string().optional(),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USERNAME: z.string().min(1, 'SMTP_USERNAME is required'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug']).default('info'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000').transform((val) => val.split(',').map((s) => s.trim())),
});

const configSchema = envSchema.superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production' && !data.PASSWORD_PEPPER) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'PASSWORD_PEPPER is mandatory in production',
      path: ['PASSWORD_PEPPER'],
    });
  }
});

type EnvConfig = z.infer<typeof configSchema>;

function validateEnv(): EnvConfig {
  const result = configSchema.safeParse(process.env);

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
  databasePoolSize: parsedConfig.DATABASE_POOL_SIZE,
  redis: {
    url: parsedConfig.REDIS_URL,
    connectTimeoutMs: parsedConfig.REDIS_CONNECT_TIMEOUT_MS,
    maxRetries: parsedConfig.REDIS_MAX_RETRIES,
    keyPrefix: parsedConfig.REDIS_KEY_PREFIX,
  },
  jwt: {
    activeKeyId: parsedConfig.JWT_ACTIVE_KEY_ID,
    keys: parsedConfig.JWT_KEYS,
    accessExpiration: parsedConfig.JWT_ACCESS_EXPIRATION,
    refreshExpiration: parsedConfig.JWT_REFRESH_EXPIRATION,
    issuer: parsedConfig.JWT_ISSUER,
    audience: parsedConfig.JWT_AUDIENCE,
  },
  argon2: {
    memoryCost: parsedConfig.ARGON2_MEMORY_COST,
    timeCost: parsedConfig.ARGON2_TIME_COST,
    parallelism: parsedConfig.ARGON2_PARALLELISM,
    pepper: parsedConfig.PASSWORD_PEPPER,
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
