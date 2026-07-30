import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, errors } = winston.format;

// Fields to mask in logs for enterprise security
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'jwt',
  'refresh_token',
  'authorization',
  'secret',
  'api_key',
];

const maskSensitiveData = winston.format((info: winston.Logform.TransformableInfo) => {
  const clone = { ...info };

  const maskObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field));

      if (isSensitive) {
        obj[key] = '***MASKED***';
      } else if (typeof obj[key] === 'object') {
        maskObject(obj[key]);
      }
    });
  };

  maskObject(clone);
  return clone;
});

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(errors({ stack: true }), timestamp(), maskSensitiveData(), json()),
  defaultMeta: { service: 'gateway', env: config.NODE_ENV },
  transports: [
    new winston.transports.Console({
      // Keep JSON formatting even in console for local aggregation (e.g., fluentbit, datadog agent)
      format: json(),
    }),
  ],
});
