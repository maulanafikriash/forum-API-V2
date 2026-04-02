import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Pool', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should create pool with connectionString when database.url is provided', async () => {
    // Arrange
    vi.doMock('../../../../Commons/config.js', () => ({
      default: {
        database: {
          url: 'postgres://user:pass@host:5432/db',
          ssl: { rejectUnauthorized: false },
        },
      },
    }));

    // Act
    const { default: pool } = await import('../pool.js');
    // Assert
    expect(pool).toBeDefined();
  });

  it('should create pool with specific config when database.url is NOT provided', async () => {
    // Arrange
    vi.doMock('../../../../Commons/config.js', () => ({
      default: {
        database: {
          host: 'localhost',
          port: 5432,
          user: 'user',
          password: 'password',
          database: 'db',
        },
      },
    }));
    // Act
    const { default: pool } = await import('../pool.js');
    // Assert
    expect(pool).toBeDefined();
  });
});
