"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const jwt_1 = require("@nestjs/jwt");
const mailer_1 = require("@nestjs-modules/mailer");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const common_controller_1 = require("./common/common.controller");
const user_controller_1 = require("./user/user.controller");
const mail_controller_1 = require("./email/mail.controller");
const app_service_1 = require("./app.service");
const common_service_1 = require("./common/common.service");
const auth_service_1 = require("./auth/auth.service");
const user_service_1 = require("./user/user.service");
const util_service_1 = require("./util/util.service");
const db_service_1 = require("./db/db.service");
const error_logger_service_1 = require("./error-logger/error-logger.service");
const aes_service_1 = require("./services/aes/aes.service");
const email_service_1 = require("./email/email.service");
const mail_service_1 = require("./email/mail.service");
const cluster_service_1 = require("./services/cluster/cluster.service");
const mail_service_2 = require("./util/mail.service");
const gmail_imap_service_1 = require("./util/gmail-imap.service");
const auth_module_1 = require("./auth/auth.module");
const bullmq_1 = require("@nestjs/bullmq");
const api_middleware_1 = require("./middleware/api.middleware");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const email_signature_controller_1 = require("./email-signature/email-signature.controller");
const email_signature_service_1 = require("./email-signature/email-signature.service");
const mail_merge_service_1 = require("./email/mail-merge.service");
const email_worker_1 = require("./email/email.worker");
const gmail_service_1 = require("./email/gmail.service");
const payment_controller_1 = require("./payment/payment.controller");
const payment_service_1 = require("./payment/payment.service");
const webhook_controller_1 = require("./payment/webhook.controller");
const isRedisEnabled = true;
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(api_middleware_1.ApiMiddleware, logger_middleware_1.LoggerMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(isRedisEnabled
                ? [
                    bullmq_1.BullModule.forRoot({
                        connection: {
                            host: process.env.REDIS_HOST || '127.0.0.1',
                            port: Number(process.env.REDIS_PORT) || 6379,
                        },
                    }),
                    bullmq_1.BullModule.registerQueue({
                        name: 'mail-queue',
                    }),
                ]
                : []),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: config.get('JWT_EXPIRES_IN') || '15m',
                    },
                }),
            }),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'youremail@gmail.com',
                        pass: 'password',
                    },
                },
                defaults: {
                    from: '"No Reply" <youremail@gmail.com>',
                },
                template: {
                    dir: (0, path_1.join)(process.cwd(), 'src', 'email', 'templates'),
                    adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                    options: { strict: true },
                },
            }),
        ],
        controllers: [
            app_controller_1.AppController,
            common_controller_1.CommonController,
            user_controller_1.UserController,
            mail_controller_1.EmailController,
            email_signature_controller_1.EmailSignatureController,
            payment_controller_1.PaymentController,
            webhook_controller_1.WebhookController
        ],
        providers: [
            app_service_1.AppService,
            common_service_1.CommonService,
            util_service_1.UtilService,
            db_service_1.DbService,
            error_logger_service_1.ErrorLoggerService,
            aes_service_1.AesService,
            auth_service_1.AuthService,
            jwt_1.JwtService,
            user_service_1.UserService,
            email_service_1.EmailService,
            mail_service_1.MailService,
            cluster_service_1.ClusterService,
            mail_service_2.IMailService,
            gmail_imap_service_1.GmailImapService,
            email_signature_service_1.EmailSignatureService,
            mail_merge_service_1.MailMergeService,
            email_worker_1.EmailWorker,
            gmail_service_1.GmailService,
            payment_service_1.PaymentService
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map