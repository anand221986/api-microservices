import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClusterService } from './services/cluster/cluster.service';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  console.time("AppBootstrap");

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  console.timeEnd("AppBootstrap");

  // --- LOGGING DIRECTORY CHECK ---
  // Fixes the ENOENT error by ensuring the directory exists at startup
  const logDir = join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // --- MIDDLEWARES ---
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
  
  app.use(compression());
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allows images to be loaded by frontend
  }));

  // --- STATIC FILES ---
  // Ensure the uploads path is absolute and correct
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
    }
  });

  // --- GLOBAL PIPES ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- CORS CONFIGURATION ---
  const allowedOrigins = [
    'http://34.31.149.20',
    'https://34.31.149.20',
    'http://api.amyntasmedia.com',
    'https://api.amyntasmedia.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // 1. Allow internal/server-side requests (no origin)
      if (!origin) return callback(null, true);

      // 2. Check against fixed list or localhost regex
      const isAllowed = allowedOrigins.includes(origin) || 
                        /^http:\/\/localhost:\d+$/.test(origin) ||
                        /^http:\/\/10\.216\.221\.3:\d+$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Log the rejected origin to debug easily in PM2 logs
        logger.error(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- SWAGGER ---
  if (process.env.ENVIRONMENT !== 'Production') {
    const config = new DocumentBuilder()
      .setTitle('AMS Tools API')
      .setDescription('API documentation for ams-tools-cms')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ?? 3002;
  console.time('NestJS Startup');
  await app.listen(port);
  console.timeEnd('NestJS Startup');
  logger.log(`Application is running on: http://localhost:${port}`);
}

ClusterService.clusterize(bootstrap);