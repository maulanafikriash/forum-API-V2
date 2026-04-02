import ThreadDetails from '../../Domains/threads/entities/ThreadDetails.js';
import CommentDetails from '../../Domains/comments/entities/CommentDetails.js';
import ReplyDetails from '../../Domains/replies/entities/ReplyDetails.js';

class GetThreadUseCaseUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload);

    const thread = await this._threadRepository.getThreadById(useCasePayload);

    const comments = await this._commentRepository.getCommentsByThreadId(useCasePayload);

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(
          comment.id,
        );
        const formattedReplies = replies.map(
          (reply) => new ReplyDetails(reply),
        );

        const likeCount = await this._likeRepository.countCommentLikes(
          comment.id,
        );

        return new CommentDetails({
          ...comment,
          replies: formattedReplies,
          likeCount: likeCount || 0,
        });
      }),
    );

    return new ThreadDetails({ ...thread, comments: commentsWithReplies });
  }
}

export default GetThreadUseCaseUseCase;
