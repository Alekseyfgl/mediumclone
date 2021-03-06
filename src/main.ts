if (!process.env.IS_TS_node) {
  require('module-alias/register');
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000, ()=> {
    console.log('Server run on ----> 3000');
  });
}
bootstrap();
