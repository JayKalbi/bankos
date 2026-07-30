import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`[Identity Service] Server is starting...`);
  console.log(`- Environment: ${config.env}`);
  console.log(`- Port: ${config.port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
