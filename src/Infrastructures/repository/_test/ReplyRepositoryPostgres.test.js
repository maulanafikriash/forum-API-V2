import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';

import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';

import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      thread_id: 'thread-123',
      content: 'isi komen',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      const newReply = new NewReply({
        commentId: 'comment-123',
        content: 'isi reply',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await replyRepositoryPostgres.addReply(newReply);

      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const newReply = new NewReply({
        commentId: 'comment-123',
        content: 'isi reply',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: 'isi reply',
        owner: 'user-123',
      });
    });
  });

  describe('verifyReplyExist function', () => {
    it('should throw NotFoundError when reply is not exist', async () => {
      const replyId = 'must be not found';

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        replyRepositoryPostgres.verifyReplyExist(replyId),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply is exist', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'isi reply',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        replyRepositoryPostgres.verifyReplyExist('reply-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when record not exist', async () => {
      const replyId = 'must be not found';
      const userId = 'lost people';

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        replyRepositoryPostgres.verifyReplyOwner({ replyId, userId }),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when record exist', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'isi reply',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        replyRepositoryPostgres.verifyReplyOwner({
          replyId: 'reply-123',
          userId: 'user-123',
        }),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete reply correctly', async () => {
      const replyId = 'reply-123';

      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: 'comment-123',
        content: 'isi reply',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await replyRepositoryPostgres.deleteReplyById(replyId);

      const result = await RepliesTableTestHelper.findReplyById(replyId);
      expect(result[0]).toHaveProperty('is_deleted', true);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies correctly', async () => {
      const replyDate1 = new Date();

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'isi reply 1',
        owner: 'user-123',
        date: replyDate1,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const replyDate2 = new Date();

      await RepliesTableTestHelper.addReply({
        id: 'reply-1234',
        comment_id: 'comment-123',
        content: 'isi reply 2',
        owner: 'user-123',
        date: replyDate2,
      });

      await RepliesTableTestHelper.markDeleted('reply-1234');

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);

      expect(replies[0]).toMatchObject({
        id: 'reply-123',
        username: 'dicoding',
        content: 'isi reply 1',
        is_deleted: false,
      });

      expect(replies[1]).toMatchObject({
        id: 'reply-1234',
        username: 'dicoding',
        content: 'isi reply 2',
        is_deleted: true,
      });

      expect(replies[0].date.getTime()).toBeLessThanOrEqual(
        replies[1].date.getTime(),
      );
    });
  });
});
