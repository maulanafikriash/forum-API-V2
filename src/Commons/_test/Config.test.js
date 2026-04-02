import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('should use .test.env behavior when NODE_ENV=test', async () => {
    process.env.NODE_ENV = 'test';
    const { default: config } = await import('../config.js');

    expect(config.app.host).toBe('localhost');
  });

  it('should use default env when NODE_ENV is not test', async () => {
    process.env.NODE_ENV = 'development';
    const { default: config } = await import('../config.js');

    expect(config.app.host).toBe('localhost');
  });

  it('should set production host correctly', async () => {
    process.env.NODE_ENV = 'production';
    const { default: config } = await import('../config.js');

    expect(config.app.host).toBe('0.0.0.0');
  });

  it('should read env variables correctly', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '5000';
    process.env.PGHOST = 'localhost';
    const { default: config } = await import('../config.js');

    expect(config.app.port).toBe('5000');
    expect(config.database.host).toBe('localhost');
  });
});
