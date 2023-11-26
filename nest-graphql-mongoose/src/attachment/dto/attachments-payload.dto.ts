import { Field, ObjectType } from '@nestjs/graphql';
import { ResponsePayloadResponse } from '../../users/dto/response-payload.dto';
import { Attachment } from '../attachment.entity';
import PaginationPayload from 'src/users/dto/pagination-payload.dto';

@ObjectType()
export class AttachmentsPayload extends ResponsePayloadResponse {
  @Field(type => [Attachment], { nullable: 'itemsAndList' })
  attachments: Attachment[];

  @Field(type => PaginationPayload, { nullable: true })
  pagination?: PaginationPayload
}