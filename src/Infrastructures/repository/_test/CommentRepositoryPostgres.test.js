import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';

import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';

import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
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
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      const newComment = new NewComment({
        threadId: 'thread-123',
        content: 'isi komen',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentRepositoryPostgres.addComment(newComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');

      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const newComment = {
        threadId: 'thread-123',
        content: 'isi komen',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      expect(addedComment).toStrictEqual({
        id: 'comment-123',
        content: 'isi komen',
        owner: 'user-123',
      });
    });
  });

  describe('verifyCommentExist function', () => {
    it('should throw NotFoundError when comment is not exist', async () => {
      const commentId = 'must be not found';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        commentRepositoryPostgres.verifyCommentExist(commentId),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when comment is exist', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'isi komen',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        commentRepositoryPostgres.verifyCommentExist('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when record not exist', async () => {
      const commentId = 'must be not found';
      const userId = 'lost people';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        commentRepositoryPostgres.verifyCommentOwner({ commentId, userId }),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when record exist', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'isi komen',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await expect(
        commentRepositoryPostgres.verifyCommentOwner({
          commentId: 'comment-123',
          userId: 'user-123',
        }),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      const commentId = 'comment-123';

      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: 'thread-123',
        content: 'isi komen',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentRepositoryPostgres.deleteCommentById(commentId);

      const result = await CommentsTableTestHelper.findCommentById(commentId);
      expect(result[0]).toHaveProperty('is_deleted', true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      const commentDate1 = new Date();

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'isi komen 1',
        owner: 'user-123',
        date: commentDate1,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const commentDate2 = new Date();

      await CommentsTableTestHelper.addComment({
        id: 'comment-1234',
        thread_id: 'thread-123',
        content: 'isi komen 2',
        owner: 'user-123',
        date: commentDate2,
      });

      await CommentsTableTestHelper.markDeleted('comment-1234');

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);

      expect(comments[0]).toMatchObject({
        id: 'comment-123',
        username: 'dicoding',
        content: 'isi komen 1',
        is_deleted: false,
      });

      expect(comments[1]).toMatchObject({
        id: 'comment-1234',
        username: 'dicoding',
        content: 'isi komen 2',
        is_deleted: true,
      });

      expect(comments[0].date.getTime()).toBeLessThanOrEqual(
        comments[1].date.getTime(),
      );
    });
  });
});
