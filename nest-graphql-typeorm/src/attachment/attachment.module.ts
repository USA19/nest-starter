import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './attachment.entity';
import { AttachmentsService } from './attachments.service';
import { UtilsModule } from '../util/utils.module';
import { AwsModule } from '../aws/aws.module';
import { AttachmentsResolver } from './attachments.resolver';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    UtilsModule, AwsModule, UsersModule
  ],

  providers: [AttachmentsService, AttachmentsResolver],
  exports: [AttachmentsService]
})
export class AttachmentModule { }
