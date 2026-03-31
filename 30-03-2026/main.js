"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const compression = require("compression");
const helmet_1 = require("helmet");
const dotenv = require("dotenv");
const cluster_service_1 = require("./services/cluster/cluster.service");
const path_1 = require("path");
dotenv.config();
async function bootstrap() {
    console.time("AppBootstrap");
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    console.timeEnd("AppBootstrap");
    app.useBodyParser('json', { limit: '10mb' });
    app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
    app.use('/uploads', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.use(compression());
    app.use((0, helmet_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    const LOCAL_HOSTS = ['localhost', '34.31.149.20', 'http://api.amyntasmedia.com/'];
    const PORTS = ['8080', '8081', '3002'];
    const origins = [
        ...LOCAL_HOSTS.flatMap(host => PORTS.map(port => `http://${host}:${port}`)),
        'http://34.31.149.20',
        'http://api.amyntasmedia.com',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const allowedPatterns = [
                /^http:\/\/localhost:\d+$/,
                /^http:\/\/10\.216\.221\.3:\d+$/,
                /^http:\/\/api\.amyntasmedia\.com$/,
            ];
            const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
            callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
        },
        credentials: true,
    });
    if (process.env.ENVIRONMENT !== 'Production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Your API Title')
            .setDescription('API description')
            .setVersion('1.0')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api', app, document);
    }
    console.time('NestJS Startup');
    await app.listen(process.env.PORT ?? 3002);
    console.timeEnd('NestJS Startup');
}
cluster_service_1.ClusterService.clusterize(bootstrap);
//# sourceMappingURL=main.js.map