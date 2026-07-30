import dotenv from 'dotenv';
import { z, ZodError, ZodIssue } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the configuration schema
const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number',
    }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  IDENTITY_SERVICE_URL: z.string().url(),
  CUSTOMER360_SERVICE_URL: z.string().url(),
  CREDIT_RISK_SERVICE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security'),
  JWT_ISSUER: z.string().default('bankos-identity'),
  JWT_AUDIENCE: z.string().default('bankos-gateway'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  PROXY_TIMEOUT_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1000, {
      message: 'PROXY_TIMEOUT_MS must be at least 1000',
    }),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:8000')
    .transform((val) => val.split(',').map((origin) => origin.trim())),
  CB_ERROR_THRESHOLD_PERCENT: z
    .string()
    .default('50')
    .transform((val) => parseInt(val, 10)),
  CB_RESET_TIMEOUT_MS: z
    .string()
    .default('30000')
    .transform((val) => parseInt(val, 10)),
  CB_MAX_CONCURRENT_REQUESTS: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),
  RETRY_COUNT: z
    .string()
    .default('3')
    .transform((val) => parseInt(val, 10)),
  RETRY_DELAY_MS: z
    .string()
    .default('1000')
    .transform((val) => parseInt(val, 10)),
});

// Infer the type of the validated configuration
export type Config = z.infer<typeof envSchema>;

// Validate the environment variables
const parseEnv = (): Config => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('❌ Configuration Validation Error:');
      const zodError = error as ZodError;
      zodError.issues.forEach((err: ZodIssue) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Unexpected Configuration Error:', error);
    }
    // Fail fast: never allow the application to start with invalid configuration
    process.exit(1);
  }
};

export const config = parseEnv();
