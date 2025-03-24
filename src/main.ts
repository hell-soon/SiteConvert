import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: 'index.html',
  });

  // Добавьте эту строку для доступа к загруженным файлам
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Настройка CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 5291;

  // Используем 0.0.0.0 для доступности в локальной сети
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Application is running on:`);
    console.log(`- Local: http://localhost:${port}`);
    console.log(`- Network: http://${getLocalIP()}:${port}`);
  });
}

// Функция для получения локального IP-адреса
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (const alias of iface) {
      const { address, family, internal } = alias;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
  return 'localhost';
}

bootstrap();
