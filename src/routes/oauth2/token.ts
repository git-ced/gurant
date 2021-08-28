/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ANCHOR UUID
import {
  v4 as uuidv4,
  v5 as uuidv5,
  validate,
} from 'uuid';

// ANCHOR Date FNS
import { isFuture, addSeconds } from 'date-fns';

// ANCHOR SERVER
import SERVER from '../../server';

import { parseClientCredentials } from '../../functions/auth';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../functions/jwt';
import { decrypt } from '../../functions/encryption';
import { TokenQueryInterface } from '../../utils/types';

SERVER.route({
  method: 'POST',
  url: '/oauth2/token',
  handler: async (req, res) => {
    const credentials = parseClientCredentials(req.headers.authorization);

    if (credentials) {
      const query = req.query as TokenQueryInterface;

      if (query.grant_type === 'authorization_code') {
        const isValidRequest = !!query.code
          && !!query.redirect_uri;

        if (isValidRequest) {
          try {
            const codeId = decrypt(query.code);
            const isValidUuid = validate(codeId);

            if (isValidUuid) {
              const { CLIENT } = await import('../../utils/graphql');

              const { authCode } = await CLIENT.GetOauthAuthorizationCodeByPk({
                id: codeId,
              });

              if (authCode) {
                if (authCode.redirect_uri === query.redirect_uri) {
                  const isValidDate = isFuture(
                    addSeconds(
                      new Date(authCode.created_at),
                      authCode.expires_in,
                    ),
                  );

                  const isValidCode = isValidDate
                    && authCode.is_active;

                  if (isValidCode) {
                    const currentToken = await CLIENT.GetOauthAccessTokenByClientUser({
                      clientId: credentials.client_id,
                      userId: authCode.user_id,
                    });

                    const id = uuidv5(String(Date.now()), uuidv4());

                    const generatedAccessToken = await signAccessToken({
                      sub: authCode.user_id,
                      iss: credentials.client_id,
                      jti: id,
                    });

                    const generatedRefreshToken = await signRefreshToken({
                      sub: authCode.user_id,
                      iss: credentials.client_id,
                      jti: id,
                    });

                    const { accessToken } = await CLIENT.CreateOauthAccessToken({
                      id,
                      createdAt: new Date().toISOString(),
                      expiresIn: 3600,
                      scope: `{${authCode.scope}}`,
                      tokenType: 'bearer',
                      clientId: credentials.client_id,
                      userId: authCode.user_id,
                      accessToken: generatedAccessToken,
                      refreshToken: generatedRefreshToken,
                    });

                    if (accessToken) {
                      if (currentToken.accessTokens.length) {
                        await CLIENT.DeleteOauthAccessTokenByPk({
                          id: currentToken.accessTokens[0],
                        });
                      }

                      await CLIENT.RevokeOauthAuthCode({
                        id: String(authCode.id),
                      });

                      return res.code(200)
                        .type('application/json; charset=utf-8')
                        .send({
                          access_token: accessToken.access_token,
                          refresh_token: accessToken.refresh_token,
                          expires_in: accessToken.expires_in,
                          scope: accessToken.scope,
                          token_type: accessToken.token_type,
                        });
                    }

                    return res.code(400)
                      .type('application/json; charset=utf-8')
                      .send({
                        error: 'invalid_request',
                        error_description: 'The request has invalid or missing parameters',
                      });
                  }

                  return res.code(400)
                    .type('application/json; charset=utf-8')
                    .send({
                      error: 'invalid_grant',
                      error_description: 'The provided authorization code is invalid or has expired',
                    });
                }

                return res.code(400)
                  .type('application/json; charset=utf-8')
                  .send({
                    error: 'invalid_request',
                    error_description: 'The redirect uri doesn\'t match the client\'s specified redirect uri.',
                  });
              }

              return res.code(400)
                .type('application/json; charset=utf-8')
                .send({
                  error: 'invalid_grant',
                  error_description: 'The provided authorization code is invalid or has expired',
                });
            }
          } catch {
            return res.code(400)
              .type('application/json; charset=utf-8')
              .send({
                error: 'invalid_grant',
                error_description: 'The provided authorization code is invalid or has expired',
              });
          }
        }
      }

      if (query.grant_type === 'refresh_token') {
        try {
          const decodedRefreshToken = await verifyRefreshToken(
            query.refresh_token,
            credentials.client_id,
          );

          const { CLIENT } = await import('../../utils/graphql');

          const { accessToken } = await CLIENT.GetOauthAccessTokenByPk({
            id: decodedRefreshToken.payload.jti,
          });

          if (accessToken && accessToken.refresh_token === query.refresh_token) {
            const generatedAccessToken = await signAccessToken({
              sub: accessToken.user_id,
              jti: accessToken.id,
            });

            const { accessToken: newAccessToken } = await CLIENT.CreateOauthAccessToken({
              id: accessToken.id,
              createdAt: accessToken.created_at,
              expiresIn: 3600,
              scope: `{${accessToken.scope}}`,
              tokenType: 'bearer',
              clientId: credentials.client_id,
              accessToken: generatedAccessToken,
              refreshToken: accessToken.refresh_token,
              userId: accessToken.user_id,
            });

            if (newAccessToken) {
              return res.code(200)
                .type('application/json; charset=utf-8')
                .send({
                  access_token: newAccessToken.access_token,
                  refresh_token: newAccessToken.refresh_token,
                  expires_in: accessToken.expires_in,
                  scope: newAccessToken.scope,
                  token_type: newAccessToken.token_type,
                });
            }
          }

          throw Error('The provided refresh token is invalid');
        } catch {
          return res.code(400)
            .type('application/json; charset=utf-8')
            .send({
              error: 'invalid_grant',
              error_description: 'The provided refresh token is invalid',
            });
        }
      }

      return res.code(400)
        .type('application/json; charset=utf-8')
        .send({
          error: 'invalid_request',
          error_description: 'The request has invalid or missing parameters',
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
