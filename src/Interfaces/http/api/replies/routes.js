import express from 'express';
import RepliesHandler from './handler.js';
import safeAuth from '../../middleware/safeAuth.js';

const routes = (container) => {
  const router = express.Router();
  const handler = new RepliesHandler(container);

  router.post(
    '/threads/:threadId/comments/:commentId/replies',
    safeAuth(container),
    handler.postReplyHandler,
  );

  router.delete(
    '/threads/:threadId/comments/:commentId/replies/:replyId',
    safeAuth(container),
    handler.deleteReplyHandler,
  );

  return router;
};

export default routes;
