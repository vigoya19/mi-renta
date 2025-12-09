import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';

async function bootstrap() {
  const app = await createApp();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${env.PORT}/graphql`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Error al arrancar el servidor', err);
  process.exit(1);
});
