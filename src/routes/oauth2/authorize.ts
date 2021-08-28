/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ANCHOR UUID
import {
  v4 as uuidv4,
  v5 as uuidv5,
} from 'uuid';

// ANCHOR SERVER
import SERVER from '../../server';

import { getUserFromAuthorization } from '../../functions/auth';
import { AuthorizationQueryInterface } from '../../utils/types';
import { composeRedirectURI } from '../../functions/compose';
import { encrypt } from '../../functions/encryption';

SERVER.route({
  method: 'GET',
  url: '/oauth2/authorize',
  handler: async (req, res) => {
    const firebaseUser = await getUserFromAuthorization(req.headers.authorization);
    const query = req.query as AuthorizationQueryInterface;

    if (firebaseUser) {
      if (query.response_type === 'code') {
        if (query.client_id && query.redirect_uri) {
          const { CLIENT } = await import('../../utils/graphql');

          const { client } = await CLIENT.GetClientByPk({
            id: query.client_id,
          });

          if (client && client.redirect_uri === query.redirect_uri) {
            const currentCode = await CLIENT.GetOauthAuthCodeByClientUser({
              clientId: query.client_id,
              userId: firebaseUser.uid,
            });

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
              res.log.info(currentCode.authCodes);
              if (currentCode.authCodes.length) {
                await CLIENT.DeleteOauthAccessTokenByPk({
                  id: currentCode.authCodes[0].id,
                });
              }

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
              error: 'invalid_request',
              error_description: 'The redirect URI doesn\'t match the client\'s specified redirect URI',
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
            error_description: 'The request is missing a required parameter',
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
          error_description: 'The authorization server does not support obtaining an authorization code using this method',
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
  },
});
