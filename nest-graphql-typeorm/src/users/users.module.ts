import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { JwtStrategy } from './auth/jwt.strategy';
import { Role } from './entities/role.entity';
import { UserSubscriber } from './subscribers/user.subscriber';
import { RedisModule } from '../redis/redis.module';
import { AwsModule } from 'src/aws/aws.module';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
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
  ],
  controllers: [UserController],
  providers: [UsersService, UsersResolver, JwtStrategy, UserSubscriber],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }