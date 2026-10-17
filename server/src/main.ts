import { loadConfig } from './app/config';
import { buildContainer } from './app/container';
import { createApp } from './app/createApp';

const config = loadConfig();
const container = buildContainer(config);
const app = createApp(container);

// Express 5 passes listen errors (e.g. EADDRINUSE) to this callback.
const server = app.listen(config.port, config.host, (err?: NodeJS.ErrnoException) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      // Never fall back to another port: the host/origin allowlist is derived from this one.
      container.logger.error('port_in_use', { port: config.port });
    } else {
      container.logger.error('server_error', { message: err.message });
    }
    process.exit(1);
  }
  container.logger.info('listening', { host: config.host, port: config.port, production: config.isProduction });
});

function shutdown(): void {
  server.close(() => {
    container.db.close();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
