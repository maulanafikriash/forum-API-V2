import { describe, it, expect, vi } from 'vitest';
import safeAuth from '../safeAuth.js';
import authMiddleware from '../auth.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

vi.mock('../auth.js', () => ({
  default: vi.fn(),
}));

describe('safeAuth', () => {
  it('should call next if container is not provided', async () => {
    const middleware = safeAuth(undefined);
    const req = {};
    const res = {};
    const next = vi.fn();
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next if container has no getInstance', async () => {
    const middleware = safeAuth({});

    const req = {};
    const res = {};
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should use authMiddleware when container is valid', () => {
    const mockManager = {};
    const mockMiddleware = vi.fn();
    authMiddleware.mockReturnValue(mockMiddleware);

    const container = {
      getInstance: vi.fn().mockReturnValue(mockManager),
    };
    const result = safeAuth(container);

    expect(container.getInstance).toHaveBeenCalledWith(
      AuthenticationTokenManager.name,
    );

    expect(authMiddleware).toHaveBeenCalledWith(mockManager);
    expect(result).toBe(mockMiddleware);
  });
});
