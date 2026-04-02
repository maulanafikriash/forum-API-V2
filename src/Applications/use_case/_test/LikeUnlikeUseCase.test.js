import { describe, it, expect, vi } from 'vitest';

import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import LikeUnlikeUseCase from '../LikeUnlikeUseCase.js';

describe('LikeUnlikeUseCase', () => {
  it('should orchestrating the like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // mock dependencies
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    // mocking function (Vitest)
    mockThreadRepository.verifyThreadExist = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = vi.fn().mockResolvedValue();
    mockLikeRepository.checkIfUserHasLikedComment = vi
      .fn()
      .mockResolvedValue(false);
    mockLikeRepository.likeComment = vi.fn().mockResolvedValue();
    mockLikeRepository.unlikeComment = vi.fn().mockResolvedValue();

    const likeUnlikeUseCase = new LikeUnlikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeUnlikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.checkIfUserHasLikedComment).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    expect(mockLikeRepository.likeComment).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    expect(mockLikeRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should orchestrating the unlike action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-1234',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExist = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExist = vi.fn().mockResolvedValue();
    mockLikeRepository.checkIfUserHasLikedComment = vi
      .fn()
      .mockResolvedValue(true);
    mockLikeRepository.likeComment = vi.fn().mockResolvedValue();
    mockLikeRepository.unlikeComment = vi.fn().mockResolvedValue();

    const likeUnlikeUseCase = new LikeUnlikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeUnlikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.checkIfUserHasLikedComment).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    expect(mockLikeRepository.unlikeComment).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    expect(mockLikeRepository.likeComment).not.toHaveBeenCalled();
  });
});
