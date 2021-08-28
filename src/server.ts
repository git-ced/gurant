// ANCHOR Fastify
import fastify from 'fastify';

// Plugins
import cors from 'fastify-cors';
import fastifyHealthcheck from 'fastify-healthcheck';
import fastifyHelmet from 'fastify-helmet';
import fastifyFormBody from 'fastify-formbody';

const SERVER = fastify({
  logger: true,
  maxParamLength: 120,
});

// Helmet
SERVER.register(fastifyHelmet);

// Form body
SERVER.register(fastifyFormBody)
  .then(() => {
    SERVER.log.info("Initialized 'fastify-formbody' plugin.");
  }, (error) => {
    SERVER.log.error(error);
  });

SERVER.register(cors).then(() => {
  SERVER.log.info("Initialized 'fastify-cors' plugin.");
}, (error) => {
  SERVER.log.error(error);
});

SERVER.register(fastifyHealthcheck);

export default SERVER;
