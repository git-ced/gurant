import { FastifyInstance } from 'fastify';
import SERVER from '../server';

interface TerminateOptionsInterface {
  coredump: boolean;
  timeout: number;
}

type TerminateResultType = (
  code: number, reason: string
) => (err: Error) => void;

const terminate = (
  server: FastifyInstance,
  options: TerminateOptionsInterface = { coredump: false, timeout: 1000 },
): TerminateResultType => {
  const exit = (): void => {
    if (options.coredump) {
      process.abort();
    } else {
      process.exit();
    }
  };

  return (code: number, reason: string) => (err: Error) => {
    SERVER.log.info(`Process exiting with code: ${code}, reason ${reason}`);

    if (err && err instanceof Error) {
      SERVER.log.info(err.message, err.stack);
    }

    // Execute graceful shutdown
    server.close(exit);
    setTimeout(exit, options.timeout).unref();
  };
};

export default terminate;
