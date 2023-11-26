import { ConfigService } from "@nestjs/config";
import { S3, SES } from "aws-sdk";

export const AwsProvider = {
  provide: 'AWS_S3',
  useFactory: async (configService: ConfigService) => {
    return new S3();
  },
  inject: [ConfigService],
}

export const AwsSimpleEmailProvider = {
  provide: 'AWS_SES',
  useFactory: async (configService: ConfigService) => {
    return new SES();
  },
  inject: [ConfigService],
}

export const S3Provider = {
  provide: 'AWS_S3',
  useFactory: async (configService: ConfigService) => {
    return new S3();
  },
  inject: [ConfigService],
}