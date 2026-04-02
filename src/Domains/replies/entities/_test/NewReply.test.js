import { describe, it, expect } from 'vitest';
import NewReply from '../NewReply.js';

describe('a NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrow(
      'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
      content: 'abc',
      owner: true,
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrow(
      'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'abc',
      owner: 'user-123',
    };

    // Action
    const { commentId, content, owner } = new NewReply(payload);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
