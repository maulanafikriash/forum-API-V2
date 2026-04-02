import { describe, it, expect, vi } from 'vitest';
import LikesHandler from '../../../Interfaces/http/api/likes/handler.js';
import LikeUnlikeUseCase from '../../../Applications/use_case/LikeUnlikeUseCase.js';

describe('LikesHandler', () => {
  it('should handle putLikeHandler correctly (success)', async () => {
    // mock usecase
    const mockExecute = vi.fn().mockResolvedValue();

    const mockUseCase = {
      execute: mockExecute,
    };

    const mockContainer = {
      getInstance: vi.fn().mockReturnValue(mockUseCase),
    };

    const handler = new LikesHandler(mockContainer);

    // mock req
    const req = {
      params: {
        threadId: 'thread-123',
        commentId: 'comment-123',
      },
      user: {
        id: 'user-123',
      },
    };

    // mock res
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    await handler.putLikeHandler(req, res, next);

    // assertions
    expect(mockContainer.getInstance).toHaveBeenCalledWith(
      LikeUnlikeUseCase.name,
    );

    expect(mockExecute).toHaveBeenCalledWith({
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
    });

    expect(next).not.toHaveBeenCalledWith();
  });

  it('should call next(error) when error occurs', async () => {
    const mockError = new Error('something wrong');

    const mockUseCase = {
      execute: vi.fn().mockRejectedValue(mockError),
    };

    const mockContainer = {
      getInstance: vi.fn().mockReturnValue(mockUseCase),
    };

    const handler = new LikesHandler(mockContainer);

    const req = {
      params: {
        threadId: 'thread-123',
        commentId: 'comment-123',
      },
      user: {
        id: 'user-123',
      },
    };

    const res = {
      status: vi.fn(),
      json: vi.fn(),
    };

    const next = vi.fn();

    await handler.putLikeHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(mockError);
  });
});
