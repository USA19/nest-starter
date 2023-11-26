import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

@Injectable()
export class DatabaseConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) { }

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('DATABASE_URI'),
    };
  }
}
