import { ResponsePayloadResponse } from '../../users/dto/response-payload.dto';
import { Attachment } from '../attachment.entity';
import PaginationPayload from 'src/users/dto/pagination-payload.dto';

export class AttachmentsPayload extends ResponsePayloadResponse {
  attachments: Attachment[];
  pagination?: PaginationPayload
}

export class AttachmentPayload extends ResponsePayloadResponse {
  attachment?: Attachment;
}