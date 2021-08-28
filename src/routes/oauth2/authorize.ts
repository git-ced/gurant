// ANCHOR UUID
import {
  v4 as uuidv4,
  v5 as uuidv5,
} from 'uuid';

// ANCHOR SERVER
import SERVER from '../../server';

import { getUserFromAuthorization, parseClientCredentials } from '../../functions/auth';
import { AuthorizationQueryInterface } from '../../utils/types';
import { composeRedirectURI } from '../../functions/compose';
import { encrypt } from '../../functions/encryption';

SERVER.route({
  method: 'GET',
  url: '/oauth2/authorize',
  handler: async (req, res) => {
    const credentials = parseClientCredentials(req.headers.authorization);
    const query = req.query as AuthorizationQueryInterface;

    if (credentials) {
      if (credentials.client_id !== query.client_id) {
        const firebaseUser = await getUserFromAuthorization(
          req.headers['user-token'] as string | undefined,
        );

        if (firebaseUser) {
          if (query.response_type === 'code') {
            const { CLIENT } = await import('../../utils/graphql');

            const id = uuidv5(String(Date.now()), uuidv4());

            const { code } = await CLIENT.CreateOauthAuthCode({
              id,
              createdAt: new Date().toISOString(),
              userId: firebaseUser.uid,
              clientId: query.client_id,
              expiresIn: 601,
              state: query.state,
              redirectUri: query.redirect_uri,
              scope: `{${query.scope}}`,
            });

            if (code) {
              const redirectURI = composeRedirectURI(
                query.redirect_uri, {
                  code: encrypt(code.id),
                  state: query.state,
                },
              );

              return res.code(200)
                .type('application/json; charset=utf-8')
                .send(redirectURI);
            }

            const redirectURI = composeRedirectURI(
              query.redirect_uri, {
                error: 'invalid_request',
                error_description: 'The server cannot process the request payload.',
                state: query.state,
              },
            );

            return res.code(200)
              .type('application/json; charset=utf-8')
              .send(redirectURI);
          }

          const redirectURI = composeRedirectURI(
            query.redirect_uri, {
              error: 'unsupported_response_type',
              error_description: 'he authorization server does not support obtaining an authorization code using this method',
              state: query.state,
            },
          );

          return res.code(200)
            .type('application/json; charset=utf-8')
            .send(redirectURI);
        }

        const redirectURI = composeRedirectURI(
          query.redirect_uri, {
            error: 'access_denied',
            error_description: 'The resource owner denied the request',
          },
        );

        return res.code(200)
          .type('application/json; charset=utf-8')
          .send(redirectURI);
      }

      const redirectURI = composeRedirectURI(
        query.redirect_uri, {
          error: 'unauthorized_client',
          error_description: 'The client is not authorized to request an authorization code.',
          state: query.state,
        },
      );

      return res.code(200)
        .type('application/json; charset=utf-8')
        .send(redirectURI);
    }

    const redirectURI = composeRedirectURI(
      query.redirect_uri, {
        error: 'invalid_client',
        error_description: 'Client authentication failed, could be an unknown client, no authentication included, or unsupported authentication method.',
      },
    );

    return res.code(200)
      .type('application/json; charset=utf-8')
      .send(redirectURI);
  },
});
