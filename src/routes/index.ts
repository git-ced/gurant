// ANCHOR Crypto
import { randomBytes } from 'crypto';

// ANCHOR ECDSA
import ECDSA from 'ecdsa-secp256r1';

// ANCHOR Server
import SERVER from '../server';

// ANCHOR Utils
import { parseClientCredentials } from '../functions/auth';
import {
  verifyAccessToken,
  verifyRefreshToken,
} from '../functions/jwt';
import { VerifyTokenQueryInterface } from '../utils/types';

// ANCHOR Routes
import './user';
import './oauth2';

if (process.env.NODE_ENV === 'development') {
  SERVER.route({
    method: 'GET',
    url: '/generate-crypto-keys',
    handler: async (_, res) => {
      const secret_key = randomBytes(16).toString('hex');
      const initialization_vector = randomBytes(8).toString('hex');

      return res.code(200)
        .type('application/json; charset=utf-8')
        .send({
          secret_key,
          initialization_vector,
        });
    },
  });

  SERVER.route({
    method: 'GET',
    url: '/generate-jwt-keys',
    handler: async (_, res) => {
      const privateKey = ECDSA.generateKey();
      const publicKey = privateKey.asPublic();

      return res.code(200)
        .type('application/json; charset=utf-8')
        .send({
          public_key: publicKey.toPEM(),
          private_key: privateKey.toPEM(),
        });
    },
  });

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
            credentials.client_id,
          );

          const { CLIENT } = await import('../utils/graphql');

          const { accessToken } = await CLIENT.GetOauthAccessTokenByPk({
            id: decodedToken.payload.jti,
          });

          if (accessToken?.is_active && accessToken.access_token === query.token) {
            return res.code(200)
              .type('application/json; charset=utf-8')
              .send({ decodedToken });
          }

          return res.code(400)
            .type('application/json; charset=utf-8')
            .send({
              error: 'invalid_grant',
              error_description: 'The given token is either invalid, expired, or revoked',
            });
        }

        if (query.token_type_hint === 'refresh_token') {
          const decodedToken = await verifyRefreshToken(
            query.token,
            credentials.client_id,
          );

          const { CLIENT } = await import('../utils/graphql');

          const { accessToken } = await CLIENT.GetOauthAccessTokenByPk({
            id: decodedToken.payload.jti,
          });

          if (accessToken?.refresh_token === query.token) {
            return res.code(200)
              .type('application/json; charset=utf-8')
              .send({ decodedToken });
          }

          return res.code(400)
            .type('application/json; charset=utf-8')
            .send({
              error: 'invalid_grant',
              error_description: 'The given token is either invalid, expired, or revoked',
            });
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
}
