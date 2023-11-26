import { Module } from '@nestjs/common';
import { Attachment, AttachmentSchema } from './attachment.entity';
import { AttachmentsService } from './attachments.service';
import { AwsModule } from '../aws/aws.module';
import { AttachmentsResolver } from './attachments.resolver';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema },
    ]),
    AwsModule,
    UsersModule
  ],

  providers: [AttachmentsService, AttachmentsResolver],
  exports: [AttachmentsService]
})
export class AttachmentModule { }
