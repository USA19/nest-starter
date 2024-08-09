import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';

interface RedisOptions {
  NX: boolean;
  EX?: number;
}

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS')
    private readonly redisService,
  ) {}

  /**
   * Sets redis Key Value
   * @param key
   * @param value
   * @param [expiresIn]
   * @returns set
   */
  async set(key: string, value: string, expiresIn?: number): Promise<string> {
    try {
      const options: RedisOptions = { NX: true };
      expiresIn && (options.EX = expiresIn);
      return this.redisService.set(key, value, options);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Gets redis Key
   * @param key
   * @returns get
   */
  async get(key: string): Promise<string> {
    try {
      return this.redisService.get(key);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Deletes redis service
   * @param key
   * @returns delete
   */
  async delete(key: string | string[]): Promise<number> {
    try {
      return this.redisService.del(key);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
