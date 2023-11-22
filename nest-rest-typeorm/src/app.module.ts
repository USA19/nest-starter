import { AttachmentsController } from './attachment/attachments.controller';
import { AttachmentModule } from './attachment/attachment.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseConfig } from './database.config';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './util/utils.module';

@Module({
  imports: [
    AttachmentModule,
    UsersModule,
    UtilsModule,
    RedisModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
  ],
  controllers: [AttachmentsController],
  providers: [AppService],
})

export class AppModule { }
