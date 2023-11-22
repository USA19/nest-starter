import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const RedisProvider = {
  provide: 'REDIS',
  useFactory: async (configService: ConfigService) => {
    const client = createClient(configService.get('redis'));
    client.on('error', onRedisError);
    client.on('connect', onRedisConnect);
    client.on('reconnecting', onRedisReconnecting);
    client.on('ready', onRedisReady);
    client.connect();
    return client;
  },
  inject: [ConfigService],
}

const onRedisError = (err: any) => { console.error("REDIS ERROR >>>>>>>>>>>>>>>>>>>>>>>>>>>", err) };
const onRedisConnect = () => { console.log("Redis connected >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>") };
const onRedisReconnecting = () => { console.log("Redis reconnecting >>>>>>>>>>>>>>>>>>>>>>>") };
const onRedisReady = () => { console.log("Redis ready! >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>") };