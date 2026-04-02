import { describe, it, expect, vi } from 'vitest';
import authMiddleware from '../auth.js';

describe('authMiddleware', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();

  it('should return 401 if no auth header', async () => {
    const req = { headers: {} };
    const middleware = authMiddleware({});

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Missing authentication',
    });
  });

  it('should return 401 if format invalid', async () => {
    const req = { headers: { authorization: 'Basic xxx' } };
    const middleware = authMiddleware({});

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next and attach user if token valid', async () => {
    const req = {
      headers: { authorization: 'Bearer validtoken' },
    };

    const mockManager = {
      decodePayload: vi.fn().mockResolvedValue({
        id: 'user-123',
        username: 'fikri',
      }),
    };

    const middleware = authMiddleware(mockManager);

    await middleware(req, res, next);

    expect(req.user).toEqual({
      id: 'user-123',
      username: 'fikri',
    });

    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token invalid', async () => {
    const req = {
      headers: { authorization: 'Bearer invalid' },
    };

    const mockManager = {
      decodePayload: vi.fn().mockRejectedValue(new Error()),
    };

    const middleware = authMiddleware(mockManager);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  });
});
