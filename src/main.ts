import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as config from 'config'

async function bootstrap() {
  const {origin} = config.get('cors')
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ['Authorization','Refresh','Content-Type','Old-Media'],
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe())
  app.use(cookieParser());
  app.useStaticAssets(join(__dirname,'..', 'uploads/avatars'), {
    prefix: '/avatars'
  });
  app.useStaticAssets(join(__dirname,'..', 'uploads/media'), {
    prefix: '/photos'
  });
  const {port} = config.get('server')
  await app.listen(port);
}
bootstrap();
