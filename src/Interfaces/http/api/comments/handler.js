import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      const { id: owner } = req.user;

      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );

      const addedComment = await addCommentUseCase.execute({
        threadId,
        content,
        owner,
      });

      return res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { commentId, threadId } = req.params;
      const { id: userId } = req.user;

      const deleteCommentUseCase = this._container.getInstance(
        DeleteCommentUseCase.name,
      );

      await deleteCommentUseCase.execute({
        commentId,
        threadId,
        userId,
      });

      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentsHandler;
