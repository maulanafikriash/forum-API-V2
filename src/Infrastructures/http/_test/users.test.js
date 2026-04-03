import { describe, it, expect, afterAll, afterEach } from 'vitest';
import request from 'supertest';

import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/users endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const app = await createServer(container);

      const response = await request(app).post('/users').send(requestPayload);

      const responseJson = response.body;

      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedUser).toBeDefined();
    });

    it('should response 400 when payload not contain needed property', async () => {
      const requestPayload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      };

      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe(
        'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when payload not meet data type specification', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: ['Dicoding Indonesia'],
      };

      const app = await createServer(container);

      const response = await request(app).post('/users').send(requestPayload);
      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe(
        'tidak dapat membuat user baru karena tipe data tidak sesuai',
      );
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const app = await createServer(container);

      const response = await request(app).post('/users').send(requestPayload);

      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe(
        'tidak dapat membuat user baru karena karakter username melebihi batas limit',
      );
    });

    it('should response 400 when username contain restricted character', async () => {
      const requestPayload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe(
        'tidak dapat membuat user baru karena username mengandung karakter terlarang',
      );
    });

    it('should response 400 when username unavailable', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding' });

      const requestPayload = {
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'super_secret',
      };

      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('username tidak tersedia');
    });
  });
  // Test Case
  describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
    // Arrange
      const app = await createServer({});
      // Action
      const response = await request(app).get('/');
      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.data).toEqual('Hello world!');
    });
  });
  // Test Case
  describe('when GET /country', () => {
    it('should return 200 and hello world', async () => {
    // Arrange
      const app = await createServer({});
      // Action
      const response = await request(app).get('/country');
      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.data).toEqual('Hello indonesia!');
    });
  });
});
