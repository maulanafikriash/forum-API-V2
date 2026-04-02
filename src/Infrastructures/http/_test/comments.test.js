import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';

import EndpointTestHelper from '../../../../tests/EndpointTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';

describe('/threads/{threadId}/comments endpoint', () => {
  let accessToken;
  let userId;
  const threadId = 'thread-123';

  beforeEach(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      title: 'judul',
      body: 'isi',
      owner: data.userId,
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Isi komen' });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment).toHaveProperty('id');
      expect(response.body.data.addedComment).toHaveProperty(
        'content',
        'Isi komen',
      );
      expect(response.body.data.addedComment).toHaveProperty('owner', userId);
    });

    it('should response 400 when payload not contain needed property', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when payload wrong data type', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: true });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .send({ content: 'Isi komen' });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when comment successfully deleted', async () => {
      const commentId = 'comment-123456';

      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        content: 'isi komen',
        owner: userId,
      });

      const app = await createServer(container);

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app).delete(
        `/threads/${threadId}/comments/dummy`,
      );

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Missing authentication');
    });

    it('should response 403 when not authorized', async () => {
      const differentUserId = 'user-12345';

      await UsersTableTestHelper.addUser({
        id: differentUserId,
        username: 'anotherUser',
        password: 'secret',
        fullname: 'not you',
      });

      const commentId = 'comment-12345';

      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        content: 'isi komen',
        owner: differentUserId,
      });

      const app = await createServer(container);

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'Anda tidak berhak menghapus comment ini',
      );
    });

    it('should response 404 when comment not found', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/not-exist`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Comment tidak ditemukan');
    });
  });
});
