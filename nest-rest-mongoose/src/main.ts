import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as basicAuth from "express-basic-auth";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { urlencoded, json } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '../../', 'static'));
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  // to prevent everyone from accessing the api docs
  app.use("/docs*",
    basicAuth({
      challenge: true,
      users: {
        usama: "Super123!",
      },
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Api')
    .setDescription('Api')
    .setVersion('1.0')
    .addTag('Api')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.use(json({ limit: '100000000kb' }));
  app.use(urlencoded({ extended: true, limit: '100000000kb' }));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('App listening on port ', port);
}

bootstrap();
