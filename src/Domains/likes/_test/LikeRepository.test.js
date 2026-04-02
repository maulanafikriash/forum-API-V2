import { describe, it, expect } from 'vitest';
import LikeRepository from '../LikeRepository.js';

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action & Assert
    await expect(
      likeRepository.checkIfUserHasLikedComment({}),
    ).rejects.toThrow('Like_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(likeRepository.likeComment({})).rejects.toThrow(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(likeRepository.unlikeComment({})).rejects.toThrow(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(likeRepository.countCommentLikes('')).rejects.toThrow(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
