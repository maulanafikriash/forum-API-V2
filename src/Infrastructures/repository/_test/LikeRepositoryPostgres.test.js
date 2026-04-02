import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

describe('LikeRepositoryPostgres', () => {
  const user1 = {
    id: 'user-123',
    username: 'username1',
    password: 'secret',
    fullname: 'full name 1',
  };

  const user2 = {
    id: 'user-321',
    username: 'username2',
    password: 'secret',
    fullname: 'full name 2',
  };

  const thread = {
    id: 'thread-123',
    title: 'judul',
    body: 'isi',
    owner: 'user-123',
  };

  const comment = {
    id: 'comment-123',
    thread_id: 'thread-123',
    content: 'isi komen',
    owner: 'user-123',
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(user1);
    await UsersTableTestHelper.addUser(user2);

    await ThreadsTableTestHelper.addThread(thread);
    await CommentsTableTestHelper.addComment(comment);
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('checkIfUserHasLikedComment function', () => {
    it('should return true if user has liked the comment', async () => {
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: comment.id,
        userId: user1.id,
        date: new Date(),
      });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const result = await likeRepositoryPostgres.checkIfUserHasLikedComment({
        commentId: comment.id,
        userId: user1.id,
      });

      expect(result).toBe(true);
    });

    it('should return false if user has not liked the comment', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const result = await likeRepositoryPostgres.checkIfUserHasLikedComment({
        commentId: comment.id,
        userId: user1.id,
      });

      expect(result).toBe(false);
    });
  });

  describe('likeComment function', () => {
    it('should persist new like correctly', async () => {
      const likePayload = {
        commentId: comment.id,
        userId: user1.id,
      };

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await likeRepositoryPostgres.likeComment(likePayload);

      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(1);
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like correctly', async () => {
      const likePayload = {
        id: 'like-123',
        commentId: comment.id,
        userId: user1.id,
        date: new Date(),
      };

      await LikesTableTestHelper.addLike(likePayload);

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await likeRepositoryPostgres.unlikeComment(likePayload);

      const like = await LikesTableTestHelper.findLikeById(likePayload.id);
      expect(like).toHaveLength(0);
    });
  });

  describe('countCommentLikes function', () => {
    it('should count likes correctly', async () => {
      const likePayload = {
        id: 'like-123',
        commentId: comment.id,
        userId: user1.id,
        date: new Date(),
      };

      const likePayload2 = {
        id: 'like-1234',
        commentId: comment.id,
        userId: user2.id,
        date: new Date(),
      };

      await LikesTableTestHelper.addLike(likePayload);
      await LikesTableTestHelper.addLike(likePayload2);

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const count = await likeRepositoryPostgres.countCommentLikes(comment.id);

      expect(count).toBe(2);
    });
  });

  it('should cover deleteLike and countCommentLikes', async () => {
    await LikesTableTestHelper.addLike({
      id: 'like-1',
      commentId: 'comment-123',
    });

    await LikesTableTestHelper.addLike({
      id: 'like-2',
      commentId: 'comment-123',
    });

    const count = await LikesTableTestHelper.countCommentLikes('comment-123');
    expect(count).toBe(2);

    await LikesTableTestHelper.deleteLike('like-1');

    const result = await LikesTableTestHelper.findLikeById('like-1');
    expect(result).toHaveLength(0);
  });
});
