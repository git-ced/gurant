import SERVER from '../server';

SERVER.route({
  method: 'GET',
  url: '/health',
  handler: async (_, res) => res.code(200)
    .type('application/json; charset=utf-8')
    .send({}),
});
