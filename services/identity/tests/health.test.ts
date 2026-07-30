import request from 'supertest';
import { app } from '../src/app';

describe('Health Endpoints', () => {
  describe('GET /health/live', () => {
    it('should return 200 and UP status', async () => {
      const response = await request(app).get('/health/live');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'UP' });
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 and UP status', async () => {
      const response = await request(app).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'UP' });
    });
  });
});
