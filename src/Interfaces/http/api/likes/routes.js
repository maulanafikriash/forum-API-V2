import express from 'express';
import LikesHandler from './handler.js';
import safeAuth from '../../middleware/safeAuth.js';

const routes = (container) => {
  const router = express.Router();
  const handler = new LikesHandler(container);

  router.put(
    '/threads/:threadId/comments/:commentId/likes',
    safeAuth(container),
    handler.putLikeHandler,
  );

  return router;
};

export default routes;
