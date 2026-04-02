import LikeUnlikeUseCase from '../../../../Applications/use_case/LikeUnlikeUseCase.js';

export default class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const { id: userId } = req.user;

      const likeUnlikeUseCase = this._container.getInstance(
        LikeUnlikeUseCase.name,
      );

      await likeUnlikeUseCase.execute({
        threadId,
        commentId,
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
