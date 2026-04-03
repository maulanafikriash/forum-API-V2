/* eslint-disable no-unused-vars */
import express from 'express';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';

import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';
import comments from '../../Interfaces/http/api/comments/index.js';
import replies from '../../Interfaces/http/api/replies/index.js';
import likes from '../../Interfaces/http/api/likes/index.js';

const createServer = async (container) => {
  const app = express();

  app.use(express.json());

  // public routes
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  // Test Case
  app.get('/', (req, res) => {
    res.status(200).json({ data: 'Hello world!' });
  });
  app.get('/country', (req, res) => {
    res.status(200).json({ data: 'Hello indonesia!' });
  });

  // threads
  app.use('/', threads(container));

  // comments, replies, likes
  app.use('/', comments(container));
  app.use('/', replies(container));
  app.use('/', likes(container));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });

  // error handler
  app.use((error, req, res, next) => {
    console.error(error);

    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

export default createServer;
