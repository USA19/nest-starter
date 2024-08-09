import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './util/utils.module';

@Module({
  imports: [
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

  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
