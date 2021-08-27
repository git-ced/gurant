// SERVER
import SERVER from './server';

import './routes';

// Graceful shutdown
import terminate from './utils/terminate';

const exitHandler = terminate(SERVER, {
  coredump: false,
  timeout: 5000,
});

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('uncaughtRejection', exitHandler(1, 'Unexpected Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));

SERVER.listen(9600, '0.0.0.0', (error, address) => {
  if (error) {
    SERVER.log.error(error.message);
    process.exit(1);
  }
  SERVER.log.info(`server listening on ${address}`);
});
