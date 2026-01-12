import { Module } from "@nestjs/common";
import { AwsSimpleEmailProvider, S3Provider } from "../aws/aws-provider";
import { AwsS3Service } from "./aws-s3.service";
@Module({
  imports: [],
  providers: [AwsSimpleEmailProvider, S3Provider, AwsS3Service],
  exports: [AwsS3Service]
})

export class AwsModule { }