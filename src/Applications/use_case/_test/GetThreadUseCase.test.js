import { describe, it, expect, vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import GetThreadUseCase from '../GetThreadUseCase.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';

import ThreadDetails from '../../../Domains/threads/entities/ThreadDetails.js';
import CommentDetails from '../../../Domains/comments/entities/CommentDetails.js';
import ReplyDetails from '../../../Domains/replies/entities/ReplyDetails.js';

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengorkestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = vi.fn().mockResolvedValue();

    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:59:16.198Z'),
      username: 'dicoding',
    });

    mockCommentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue([
      {
        id: 'comment-123',
        username: 'johndoe',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        is_deleted: false,
      },
      {
        id: 'comment-234',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'some racist comment',
        is_deleted: true,
      },
    ]);

    mockLikeRepository.countCommentLikes = vi.fn((commentId) => {
      if (commentId === 'comment-123') {
        return Promise.resolve(1);
      }
      return Promise.resolve(2);
    });

    mockReplyRepository.getRepliesByCommentId = vi.fn((commentId) => {
      if (commentId === 'comment-123') {
        return Promise.resolve([
          {
            id: 'reply-123',
            content: 'some racist reply',
            date: new Date('2021-08-08T07:59:48.766Z'),
            username: 'johndoe',
            is_deleted: true,
          },
          {
            id: 'reply-234',
            content: 'sebuah balasan',
            date: new Date('2021-08-08T08:07:01.522Z'),
            username: 'dicoding',
            is_deleted: false,
          },
        ]);
      }
      return Promise.resolve([]);
    });

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      useCasePayload,
    );

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCasePayload,
    );

    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCasePayload,
    );

    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      'comment-123',
    );

    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      'comment-234',
    );

    expect(mockLikeRepository.countCommentLikes).toHaveBeenCalledTimes(2);
    expect(mockLikeRepository.countCommentLikes).toHaveBeenCalledWith(
      'comment-123',
    );
    expect(mockLikeRepository.countCommentLikes).toHaveBeenLastCalledWith(
      'comment-234',
    );

    expect(thread).toEqual(
      new ThreadDetails({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date('2021-08-08T07:59:16.198Z'),
        username: 'dicoding',
        comments: [
          new CommentDetails({
            id: 'comment-123',
            username: 'johndoe',
            date: new Date('2021-08-08T07:22:33.555Z'),
            content: 'sebuah comment',
            is_deleted: false,
            likeCount: 1,
            replies: [
              new ReplyDetails({
                id: 'reply-123',
                content: 'some racist reply',
                date: new Date('2021-08-08T07:59:48.766Z'),
                username: 'johndoe',
                is_deleted: true,
              }),
              new ReplyDetails({
                id: 'reply-234',
                content: 'sebuah balasan',
                date: new Date('2021-08-08T08:07:01.522Z'),
                username: 'dicoding',
                is_deleted: false,
              }),
            ],
          }),
          new CommentDetails({
            id: 'comment-234',
            username: 'dicoding',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'some racist comment',
            is_deleted: true,
            likeCount: 2,
            replies: [],
          }),
        ],
      }),
    );
  });
});
