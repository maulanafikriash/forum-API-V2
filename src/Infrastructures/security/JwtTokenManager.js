import AuthenticationTokenManager from '../../Applications/security/AuthenticationTokenManager.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    return this._jwt.sign(payload, process.env.ACCESS_TOKEN_KEY);
  }

  async createRefreshToken(payload) {
    return this._jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  }

  async verifyRefreshToken(token) {
    try {
      this._jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const decoded = this._jwt.decode(token);
    return decoded;
  }
}

export default JwtTokenManager;
