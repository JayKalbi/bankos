// tests/setup.ts
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/testdb';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '2525';
process.env.SMTP_USERNAME = 'testuser';
process.env.SMTP_PASSWORD = 'testpassword';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3000';
