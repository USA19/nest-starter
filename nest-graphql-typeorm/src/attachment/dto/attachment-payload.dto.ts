import { Field, ObjectType } from '@nestjs/graphql';
import { ResponsePayload, ResponsePayloadResponse } from '../../users/dto/response-payload.dto';
import { Attachment } from '../attachment.entity';

@ObjectType()
export class AttachmentPayload extends ResponsePayloadResponse {
  @Field({ nullable: true })
  attachment: Attachment;

  @Field({ nullable: true })
  response?: ResponsePayload
}

@ObjectType()
export class AttachmentMediaPayload extends ResponsePayloadResponse {
  @Field({ nullable: true })
  preSignedUrl: string;

  @Field({ nullable: true })
  response?: ResponsePayload
}
