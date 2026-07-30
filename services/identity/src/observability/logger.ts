import winston from 'winston';
import { asyncLocalStorage } from '../middlewares/correlationId';
import { config } from '../config';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'jwt',
  'authorization',
  'cookie',
  'set-cookie',
  'smtppassword',
  'jwtprivatekey',
  'secret',
]);

const maskSensitiveData = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const maskedObj: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      maskedObj[key] = '[REDACTED]';
    } else {
      maskedObj[key] = maskSensitiveData((obj as Record<string, unknown>)[key]);
    }
  }

  return maskedObj;
};

const maskFormat = winston.format((info) => {
  return maskSensitiveData(info) as winston.Logform.TransformableInfo;
});

const injectCorrelationId = winston.format((info) => {
  const store = asyncLocalStorage.getStore();
  if (store && store.has('correlationId')) {
    info.correlationId = store.get('correlationId');
  }
  return info;
});

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  injectCorrelationId(),
  maskFormat(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: {
    service: 'identity-service',
    env: config.env,
  },
  format: baseFormat,
  transports: [
    new winston.transports.Console(),
  ],
});
