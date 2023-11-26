import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { JwtStrategy } from './auth/jwt.strategy';
import { Role, RoleSchema } from './entities/role.entity';
import { RedisModule } from '../redis/redis.module';
import { AwsModule } from 'src/aws/aws.module';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
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
  providers: [UsersService, UsersResolver, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule { }