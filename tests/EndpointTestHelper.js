import request from 'supertest';
import createServer from '../src/Infrastructures/http/createServer.js';
import container from '../src/Infrastructures/container.js';
import UsersTableTestHelper from './UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from './AuthenticationsTableTestHelper.js';

const EndpointTestHelper = {
  async getAccessTokenAndUserIdHelper() {
    const app = await createServer(container);
    const randomNumber = Math.floor(Math.random() * 1000);

    const userPayload = {
      username: `user${randomNumber}`,
      password: `secret${randomNumber}`,
      fullname: `full name ${randomNumber}`,
    };

    // Register user
    const responseUser = await request(app).post('/users').send(userPayload);

    // Login user
    const responseAuth = await request(app).post('/authentications').send({
      username: userPayload.username,
      password: userPayload.password,
    });

    const { id: userId } = responseUser.body.data.addedUser;
    const { accessToken } = responseAuth.body.data;

    return { accessToken, userId };
  },

  async cleanTables() {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  },
};

export default EndpointTestHelper;
