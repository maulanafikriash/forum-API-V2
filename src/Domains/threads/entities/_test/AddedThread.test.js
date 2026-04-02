import { describe, it, expect } from 'vitest';
import AddedThread from '../AddedThread.js';

describe('a AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrow(
      'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      title: 123,
      owner: 'abc',
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrow(
      'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create addedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'judul',
      owner: 'user-123',
    };

    // Action
    const { title, id, owner } = new AddedThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(id).toEqual(payload.id);
    expect(owner).toEqual(payload.owner);
  });
});
