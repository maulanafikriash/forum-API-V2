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
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

describe('/threads endpoint', () => {
  let accessToken;
  let userId;

  beforeEach(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'judul',
        body: 'isi',
      };

      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      const responseJson = response.body;

      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toHaveProperty('id');
      expect(responseJson.data.addedThread).toHaveProperty(
        'title',
        requestPayload.title,
      );
      expect(responseJson.data.addedThread).toHaveProperty('owner', userId);
    });

    it('should response 400 when payload not contain needed property', async () => {
      const requestPayload = { title: 'judul' };

      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when payload not meet data type specification', async () => {
      const requestPayload = {
        title: 'judul',
        body: true,
      };

      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      const responseJson = response.body;

      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when access token not provided', async () => {
      const requestPayload = {
        title: 'judul',
        body: 'isi',
      };

      const app = await createServer(container);
      const response = await request(app).post('/threads').send(requestPayload);
      const responseJson = response.body;

      expect(response.statusCode).toBe(401);
      expect(responseJson.message).toBe('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 when request valid', async () => {
      const userData1 = {
        id: 'user-1',
        username: 'username1',
        password: 'secret',
        fullname: 'full name 1',
      };
      await UsersTableTestHelper.addUser(userData1);

      const userData2 = {
        id: 'user-2',
        username: 'username2',
        password: 'secret',
        fullname: 'full name 2',
      };
      await UsersTableTestHelper.addUser(userData2);

      const threadData = {
        id: 'thread-123',
        title: 'judul',
        body: 'isi',
        owner: userData1.id,
        date: new Date('2026-03-01'),
      };
      await ThreadsTableTestHelper.addThread(threadData);

      const commentData1 = {
        id: 'comment-1',
        threadId: threadData.id,
        content: 'komentar 1',
        date: new Date('2026-03-02'),
        owner: userData1.id,
      };
      await CommentsTableTestHelper.addComment(commentData1);

      const commentData2 = {
        id: 'comment-2',
        threadId: threadData.id,
        content: 'komentar 2',
        date: new Date('2026-03-03'),
        owner: userData2.id,
        isDeleted: true,
      };
      await CommentsTableTestHelper.addComment(commentData2);

      const replyData1 = {
        id: 'reply-1',
        commentId: commentData1.id,
        content: 'balasan 1',
        date: new Date('2026-03-04'),
        owner: userData1.id,
      };
      await RepliesTableTestHelper.addReply(replyData1);

      const replyData2 = {
        id: 'reply-2',
        commentId: commentData1.id,
        content: 'balasan 2',
        date: new Date('2026-03-04'),
        owner: userData2.id,
        isDeleted: true,
      };
      await RepliesTableTestHelper.addReply(replyData2);

      await LikesTableTestHelper.addLike({ id: 'like-1', commentId: commentData1.id, userId: userData1.id });
      await LikesTableTestHelper.addLike({ id: 'like-2', commentId: commentData1.id, userId: userData2.id });
      await LikesTableTestHelper.addLike({ id: 'like-3', commentId: commentData2.id, userId: userData1.id });

      const expectedThread = {
        id: threadData.id,
        title: threadData.title,
        body: threadData.body,
        date: threadData.date.toISOString(),
        username: userData1.username,
        comments: [
          {
            id: commentData1.id,
            content: commentData1.content,
            date: commentData1.date.toISOString(),
            username: userData1.username,
            likeCount: 2,
            replies: [
              {
                id: replyData1.id,
                content: replyData1.content,
                date: replyData1.date.toISOString(),
                username: userData1.username,
              },
              {
                id: replyData2.id,
                content: '**balasan telah dihapus**',
                date: replyData2.date.toISOString(),
                username: userData2.username,
              },
            ],
          },
          {
            id: commentData2.id,
            content: '**komentar telah dihapus**',
            date: commentData2.date.toISOString(),
            username: userData2.username,
            likeCount: 1,
            replies: [],
          },
        ],
      };

      const app = await createServer(container);
      const response = await request(app).get(`/threads/${threadData.id}`);
      const responseJson = response.body;

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toStrictEqual(expectedThread);
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);
      const response = await request(app).get('/threads/not-found');
      const responseJson = response.body;

      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('Thread tidak ditemukan');
    });
  });
});
