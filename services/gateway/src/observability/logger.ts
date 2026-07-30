import winston from 'winston';
import { config } from '../config';
import { asyncLocalStorage } from '../middlewares/correlationId';

const { combine, timestamp, json, errors } = winston.format;

// Fields to mask in logs for enterprise security
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'secret',
  'token',
  'jwt',
  'authorization',
  'refresh_token',
  'access_token',
  'api_key',
  'cookie',
  'set-cookie',
];

const injectCorrelationId = winston.format((info: winston.Logform.TransformableInfo) => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    const correlationId = store.get('correlationId');
    if (correlationId) {
      info.correlationId = correlationId;
    }
  }
  return info;
});

const maskSensitiveData = winston.format((info: winston.Logform.TransformableInfo) => {
  const clone = { ...info };

  const maskObject = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return;

    const target = obj as Record<string, unknown>;

    Object.keys(target).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field));

      if (isSensitive) {
        target[key] = '***MASKED***';
      } else if (typeof target[key] === 'object') {
        maskObject(target[key]);
      }
    });
  };

  maskObject(clone);
  return clone;
});

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp(),
    injectCorrelationId(),
    maskSensitiveData(),
    json(),
  ),
  defaultMeta: { service: 'gateway', env: config.NODE_ENV },
  transports: [
    new winston.transports.Console({
      // Keep JSON formatting even in console for local aggregation (e.g., fluentbit, datadog agent)
      format: json(),
    }),
  ],
});
