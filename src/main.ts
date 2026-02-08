import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClusterService } from './services/cluster/cluster.service';
import { join } from 'path';
dotenv.config();
async function bootstrap() {
  console.log(process.env.PORT )
  // cast app to NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
// Increase payload limit to 10MB (or whatever you need)
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
   // CORS headers for static files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // or your frontend URL
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  // Security & performance middlewares
  app.use(compression());
  app.use(helmet());

  // Optional: global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // -------------------- STATIC FILES --------------------
  // Serve uploads folder
  // app.useStaticAssets(join('/var/www/html/cms/uploads'), {
  //   prefix: '/uploads',
  // });
   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // -------------------- CORS --------------------
  const LOCAL_HOSTS = ['localhost', '34.31.149.20'];
  const PORTS = ['8080', '8081','3002'];
  const origins = [
  ...LOCAL_HOSTS.flatMap(host =>
    PORTS.map(port => `http://${host}:${port}`)
  ),
  'http://34.31.149.20', // no port
];
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/10\.216\.221\.3:\d+$/,
      /^http:\/\/72\.61\.229\.100(:\d+)?$/,
    ];
    const isAllowed = allowedPatterns.some(pattern =>
      pattern.test(origin)
    );

    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
});

  // -------------------- SWAGGER --------------------
  if (process.env.ENVIRONMENT !== 'Production') {
    const config = new DocumentBuilder()
      .setTitle('Your API Title')
      .setDescription('API description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT ?? 3002);
}

ClusterService.clusterize(bootstrap);
