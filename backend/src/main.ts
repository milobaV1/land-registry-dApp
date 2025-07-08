import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.use(
    session({
      secret: 'your_super_secret_key',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, 
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.enableCors({
  origin: 'http://localhost:5173', 
  credentials: true,
});

const config = new DocumentBuilder()
    .setTitle('Land Registry dApp')
    .setDescription('Prototype')
    .setVersion('1.0')
    .addTag('registry')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
