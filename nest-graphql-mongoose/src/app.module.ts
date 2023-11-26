import { SeedersModule } from './seeders/seeders.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommandModule } from 'nestjs-command';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseConfig } from './database.config';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './util/utils.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    SeedersModule,
    UsersModule,
    UtilsModule,
    RedisModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ req }),
      introspection: true,
      playground: true,
      driver: ApolloDriver,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
      inject: [ConfigService],
    }),

    CommandModule   //for seeding data
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
