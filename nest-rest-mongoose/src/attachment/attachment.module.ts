import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, AttachmentSchema } from './attachment.entity';
import { AttachmentsService } from './attachments.service';
import { AwsModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';
import { AttachmentsController } from './attachments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema },
    ]),
    AwsModule,
    UsersModule
  ],

  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService]
})
export class AttachmentModule { }
