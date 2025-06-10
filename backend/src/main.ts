import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.use(
    session({
      secret: 'your_super_secret_key', //Use your env here
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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
