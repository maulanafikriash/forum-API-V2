import { describe, it, expect } from 'vitest';
import request from 'supertest';
import createServer from '../createServer.js';

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    const app = await createServer({});

    const response = await request(app).get('/unregisteredRoute');

    expect(response.statusCode).toBe(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };

    const app = await createServer({});

    // Action
    const response = await request(app).post('/users').send(requestPayload);

    // Assert
    expect(response.statusCode).toBe(500);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('terjadi kegagalan pada server kami');
  });
});
