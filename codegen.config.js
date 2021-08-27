require('dotenv').config();

module.exports = {
  schema: [
    {
      'https://oauth-sample.hasura.app/v1/graphql': {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        }
      },
    },
  ],
  documents: "src/graphql/documents/**/*.gql",
  overwrite: true,
  generates: {
    'src/graphql/types.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        avoidOptionals: false,
        immutableTypes: true,
      },
    },
  },
}

