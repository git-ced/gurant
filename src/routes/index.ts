import SERVER from '../server';
import { parseClientCredentials } from '../utils/encryption';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

SERVER.route({
  method: 'GET',
  url: '/generate-jwt-token',
  handler: async (_, res) => res.code(200)
    .type('application/json; charset=utf-8')
    .send({}),
});

interface VerifyTokenQueryInterface {
  token: string;
  token_type_hint: 'access_token' | 'refresh_token';
}

SERVER.route({
  method: 'GET',
  url: '/verify-token',
  handler: async (req, res) => {
    const query = req.query as VerifyTokenQueryInterface;
    const credentials = parseClientCredentials(req.headers.authorization);

    if (credentials) {
      if (query.token_type_hint === 'access_token') {
        const decodedToken = await verifyAccessToken(
          query.token,
          '',
        );

        return res.code(200)
          .type('application/json; charset=utf-8')
          .send({ decodedToken });
      }

      if (query.token_type_hint === 'refresh_token') {
        const decodedToken = await verifyRefreshToken(
          query.token,
          '',
        );

        return res.code(200)
          .type('application/json; charset=utf-8')
          .send({ decodedToken });
      }

      return res.code(400)
        .type('application/json; charset=utf-8')
        .send({
          error: 'invalid_type',
          error_description: 'The given token type is not supported. Supported values only include `access_token` and `refresh_token`.',
        });
    }

    return res.code(401)
      .type('application/json; charset=utf-8')
      .send({
        error: 'invalid_client',
        error_description: 'Client authentication failed, could be an unknown client, no authentication included, or unsupported authentication method.',
      });
  },
});
