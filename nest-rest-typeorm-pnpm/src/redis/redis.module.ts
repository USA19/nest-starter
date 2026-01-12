import { Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService, RedisProvider],
  exports: [RedisService],
})
export class RedisModule {}
