import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
/* Controllers */
import { AppController } from './app.controller';
import { CommonController } from './common/common.controller';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { EmailController } from './email/mail.controller';
/* Services */
import { AppService } from './app.service';
import { CommonService } from './common/common.service';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { ErrorLoggerService } from './error-logger/error-logger.service';
import { AesService } from './services/aes/aes.service';
import { EmailService } from './email/email.service';
import { MailService } from './email/mail.service';
import { ClusterService } from './services/cluster/cluster.service';
import { IMailService } from './util/mail.service';
import { GmailImapService } from './util/gmail-imap.service';
import { AuthModule } from './auth/auth.module';
/* Middleware */
import { ApiMiddleware } from './middleware/api.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { EmailSignatureController } from './email-signature/email-signature.controller';
import { EmailSignatureService } from './email-signature/email-signature.service';
import { MailMergeService } from './email/mail-merge.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),

    MailerModule.forRoot({
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
        dir: join(process.cwd(), 'src', 'email', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],

  controllers: [
    AppController,
    CommonController,
    AuthController,
    UserController,
    EmailController,
    EmailSignatureController
  ],

  providers: [
    AppService,
    CommonService,
    UtilService,
    DbService,
    ErrorLoggerService,
    AesService,
    AuthService,
    JwtService,
    UserService,
    EmailService,
    MailService,
    ClusterService,
    IMailService,
    GmailImapService,
    EmailSignatureService,
    MailMergeService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
