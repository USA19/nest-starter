import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './attachment.entity';
import { AttachmentsService } from './attachments.service';
import { UtilsModule } from '../util/utils.module';
import { AwsModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';
import { AttachmentsController } from './attachments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    UtilsModule, AwsModule, UsersModule
  ],

  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService]
})
export class AttachmentModule { }
