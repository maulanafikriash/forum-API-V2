/* eslint-disable no-unused-vars */
const authMiddleware = (authenticationTokenManager) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'fail',
        message: 'Missing authentication',
      });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid authentication format',
      });
    }

    const payload = await authenticationTokenManager.decodePayload(token);

    req.user = {
      id: payload.id,
      username: payload.username,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;
