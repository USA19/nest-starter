import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResponsePayloadResponse } from '../../users/dto/response-payload.dto';
import { Attachment } from '../attachment.entity';
import PaginationPayload from 'src/users/dto/pagination-payload.dto';

export class AttachmentsPayload extends ResponsePayloadResponse {
  @ApiProperty({ type: [Attachment] })
  attachments: Attachment[];

  @ApiPropertyOptional({ type: PaginationPayload })
  pagination?: PaginationPayload
}

export class AttachmentPayload extends ResponsePayloadResponse {
  @ApiPropertyOptional({ type: Attachment })
  attachment?: Attachment;
}