import express from 'express';
import CommentsHandler from './handler.js';
import safeAuth from '../../middleware/safeAuth.js';

const routes = (container) => {
  const router = express.Router();
  const handler = new CommentsHandler(container);

  router.post(
    '/threads/:threadId/comments',
    safeAuth(container),
    handler.postCommentHandler,
  );

  router.delete(
    '/threads/:threadId/comments/:commentId',
    safeAuth(container),
    handler.deleteCommentHandler,
  );

  return router;
};

export default routes;
