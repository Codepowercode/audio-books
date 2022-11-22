import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { User } from './users/user.entity';
import { Book } from './books/entities/book.entity';
import { BooksModule } from './books/books.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailModule } from './mail/mail.module';
import { StatusesModule } from './statuses/statuses.module';
import { NarratorsModule } from './narrators/narrators.module';
import { GenresModule } from './genres/genres.module';
import { Genre } from './genres/entities/genre.entity';
import { Status } from './statuses/entities/status.entity';
import { Narrator } from './narrators/entities/narrator.entity';
import { MulterModule } from '@nestjs/platform-express';
import { PaymentsModule } from './payments/payments.module';
import { Card } from './payments/entities/card.entity';
import { Payment } from './payments/entities/payments.entity';
import { ContactUsModule } from './contact-us/contact-us.module';
import { ContactUs } from './contact-us/entities/contact-us.entity';
import { ContactUsOptions } from './contact-us/entities/contact-us-options.entity';
import { LicensesModule } from './licenses/licenses.module';
import { License } from './licenses/entities/license.entity';
import { AudioBook } from './books/entities/audiobook.entity';
import { Subscription } from './payments/entities/subscription.entity';
import { Token } from './auth/entities/token.entity';

const entities = [
  User,
  Book,
  AudioBook,
  Genre,
  Status,
  Narrator,
  Card,
  ContactUs,
  ContactUsOptions,
  License,
  Payment,
  Subscription,
  Token,
];

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('EMAIL_HOST'),
          port: config.get('EMAIL_PORT'),
          secure: true,
          auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: 'uofdeveloper@gmail.com',
        },
        template: {
          dir: join(__dirname, './src/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: entities,
      synchronize: true,
    }),
    MulterModule.register({
      dest: './public',
    }),

    UsersModule,
    AuthModule,
    BooksModule,
    MailModule,
    StatusesModule,
    NarratorsModule,
    GenresModule,
    PaymentsModule,
    ContactUsModule,
    LicensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
