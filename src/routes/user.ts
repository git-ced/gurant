/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ANCHOR UUID
import {
  v4 as uuidv4,
  v5 as uuidv5,
} from 'uuid';

// ANCHOR SERVER
import SERVER from '../server';

import { CreateUserPayloadInterface, UpdateClientParamsInterface } from '../utils/types';
import { getUserFromAuthorization } from '../functions/auth';
import { encrypt } from '../functions/encryption';

SERVER.route({
  method: 'GET',
  url: '/user',
  handler: async (req, res) => {
    const firebaseUser = await getUserFromAuthorization(req.headers.authorization);

    if (firebaseUser) {
      const { CLIENT } = await import('../utils/graphql');

      const { user } = await CLIENT.GetUserByPk({
        id: firebaseUser.uid,
      });

      if (user) {
        return res.code(200)
          .type('application/json; charset=utf-8')
          .send(user);
      }
    }

    return res.code(401)
      .type('application/json; charset=utf-8')
      .send({
        error: 'invalid_owner',
        error_description: 'Resource owner authentication failed, could be an unknown resource owner, no authentication included, or unsupported authentication method.',
      });
  },
});

SERVER.route({
  method: 'POST',
  url: '/user',
  handler: async (req, res) => {
    const firebaseUser = await getUserFromAuthorization(req.headers.authorization);

    if (firebaseUser && firebaseUser.email) {
      const body = req.body as CreateUserPayloadInterface;

      const clientIdLive = uuidv5(String(Date.now()), uuidv4());
      const clientSecretLive = uuidv5(firebaseUser.uid, clientIdLive);
      const clientIdTest = uuidv5(String(Date.now()), uuidv4());
      const clientSecretTest = uuidv5(firebaseUser.uid, clientIdTest);

      const { CLIENT } = await import('../utils/graphql');

      const { user } = await CLIENT.CreateUser({
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? 'Anonymous',
        email: firebaseUser.email,
        redirectURI: body.redirect_uri,
        clientIdLive: `pk_live_${encrypt(clientIdLive)}`,
        clientSecretLive: `sk_live_${encrypt(clientSecretLive)}`,
        clientIdTest: `pk_test_${encrypt(clientIdTest)}`,
        clientSecretTest: `sk_test_${encrypt(clientSecretTest)}`,
      });

      if (user) {
        return res.code(200)
          .type('application/json; charset=utf-8')
          .send(user);
      }
    }

    return res.code(401)
      .type('application/json; charset=utf-8')
      .send({
        error: 'invalid_owner',
        error_description: 'Resource owner authentication failed, could be an unknown resource owner, no authentication included, or unsupported authentication method.',
      });
  },
});

SERVER.route({
  method: 'PUT',
  url: '/user/clients/:client_id',
  handler: async (req, res) => {
    const firebaseUser = await getUserFromAuthorization(req.headers.authorization);

    if (firebaseUser) {
      const body = req.body as CreateUserPayloadInterface;
      const params = req.params as UpdateClientParamsInterface;

      const { CLIENT } = await import('../utils/graphql');

      const { client } = await CLIENT.UpdateClientByPk({
        id: params.client_id,
        redirectURI: body.redirect_uri,
      });

      if (client) {
        return res.code(200)
          .type('application/json; charset=utf-8')
          .send(client);
      }

      return res.code(400)
        .type('application/json; charset=utf-8')
        .send({
          error: 'invalid_request',
          error_description: 'Unknown client',
        });
    }

    return res.code(401)
      .type('application/json; charset=utf-8')
      .send({
        error: 'invalid_owner',
        error_description: 'Resource owner authentication failed, could be an unknown resource owner, no authentication included, or unsupported authentication method.',
      });
  },
});
