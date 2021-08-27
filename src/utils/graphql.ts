import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../graphql/types';

const ENDPOINT = 'https://gurant.hasura.app/v1/graphql';

const client = () => (
  new GraphQLClient(ENDPOINT, {
    headers: {
      'content-type': 'application/json',
      'Accept-Encoding': 'br, gzip',
      'X-Hasura-Admin-Secret': String(process.env.HASURA_ADMIN_SECRET),
    },
  })
);

// eslint-disable-next-line import/prefer-default-export
export const CLIENT = getSdk(client());
