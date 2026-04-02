import authMiddleware from './auth.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

const safeAuth = (container) => {
  if (!container || !container.getInstance) {
    return (req, res, next) => next();
  }

  const authenticationTokenManager = container.getInstance(
    AuthenticationTokenManager.name,
  );

  return authMiddleware(authenticationTokenManager);
};

export default safeAuth;
