import app from './app';
import * as http from 'http';
import { config } from './config';

const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log(`API Gateway is starting in ${config.NODE_ENV} mode...`);
  console.log(`Listening on port ${config.PORT}`);
});

// Placeholder for graceful shutdown (SIGTERM, SIGINT)
