import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { JwtStrategy } from './auth/jwt.strategy';
import { RedisModule } from '../redis/redis.module';
import { AwsModule } from 'src/aws/aws.module';
import { UsersController } from './users.controller';
import { GoogleStrategy } from './auth/google-auth-strategy';
import { FacebookStrategy } from './auth/facebook-auth-strategy';
import { GithubStrategy } from './auth/github-auth-strategy';
import { TwilioModule } from '../twilio/twilio.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY') },
      }),
      inject: [ConfigService],
    }),

    RedisModule,
    AwsModule,
    TwilioModule,
    PrismaModule
  ],
  controllers: [UsersController],
  providers: [UsersResolver,
    UsersService, JwtStrategy, GoogleStrategy, FacebookStrategy, GithubStrategy],
  exports: [UsersService],
})
export class UsersModule { }