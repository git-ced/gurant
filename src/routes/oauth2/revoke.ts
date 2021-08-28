// ANCHOR SERVER
import SERVER from '../../server';

import { parseClientCredentials } from '../../functions/auth';
import { verifyAccessToken } from '../../functions/jwt';
import { RevokeQueryInterface } from '../../utils/types';

SERVER.route({
  method: 'POST',
  url: '/revoke',
  handler: async (req, res) => {
    const credentials = parseClientCredentials(req.headers.authorization);

    if (credentials) {
      const query = req.query as RevokeQueryInterface;

      if (query.token_type_hint === 'access_token') {
        try {
          const decodedAccessToken = await verifyAccessToken(
            query.token,
            credentials.client_id,
          );

          const { CLIENT } = await import('../../utils/graphql');

          await CLIENT.RevokeOauthAccessToken({
            id: decodedAccessToken.payload.jti,
          });

          res.code(200)
            .type('application/json; charset=utf-8')
            .send({});
        } catch {
          return res.code(400)
            .type('application/json; charset=utf-8')
            .send({
              error: 'invalid_grant',
              error_description: 'The provided access token is invalid or already expired',
            });
        }
      }

      return res.code(400)
        .type('application/json; charset=utf-8')
        .send({
          error: 'unsupported_token_type',
          error_description: 'The authorization server does not support the revocation of the presented token type.',
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
