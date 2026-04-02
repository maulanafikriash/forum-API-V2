import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';

import EndpointTestHelper from '../../../../tests/EndpointTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let accessToken;
  let userId;
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  beforeEach(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      title: 'judul',
      body: 'isi',
      owner: userId,
    });

    await CommentsTableTestHelper.addComment({
      id: commentId,
      thread_id: threadId,
      content: 'isi komen',
      owner: userId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Isi reply' });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply).toHaveProperty('id');
      expect(response.body.data.addedReply).toHaveProperty(
        'content',
        'Isi reply',
      );
      expect(response.body.data.addedReply).toHaveProperty('owner', userId);
    });

    it('should response 400 when payload not contain needed property', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when payload wrong data type', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: true });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'tidak dapat membuat reply baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send({ content: 'Isi reply' });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when reply successfully deleted', async () => {
      const replyId = 'reply-123456';

      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: commentId,
        content: 'isi reply',
        owner: userId,
      });

      const app = await createServer(container);

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app).delete(
        `/threads/${threadId}/comments/${commentId}/replies/dummy`,
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

      const replyId = 'reply-123456';

      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: commentId,
        content: 'isi reply',
        owner: differentUserId,
      });

      const app = await createServer(container);

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'Anda tidak berhak menghapus reply ini',
      );
    });

    it('should response 404 when reply not found', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/not-exist`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Reply tidak ditemukan');
    });
  });
});
