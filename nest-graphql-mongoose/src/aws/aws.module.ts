import { Module } from "@nestjs/common";
import { AwsSimpleEmailProvider, S3Provider } from "../aws/aws-provider";
import { AwsSimpleEmailService } from "./aws-ses.service";
import { AwsS3Service } from "./aws-s3.service";
@Module({
  imports: [],
  providers: [AwsSimpleEmailProvider, AwsSimpleEmailService, S3Provider, AwsS3Service],
  exports: [AwsSimpleEmailService, AwsS3Service]
})

export class AwsModule { }