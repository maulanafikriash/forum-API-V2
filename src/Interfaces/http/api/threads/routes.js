import express from 'express';
import ThreadsHandler from './handler.js';
import safeAuth from '../../middleware/safeAuth.js';

const routes = (container) => {
  const router = express.Router();
  const handler = new ThreadsHandler(container);

  // protected
  router.post('/threads', safeAuth(container), handler.postThreadHandler);
  // public
  router.get('/threads/:threadId', handler.getThreadHandler);

  return router;
};

export default routes;
