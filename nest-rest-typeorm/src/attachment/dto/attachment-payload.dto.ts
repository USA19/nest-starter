import { ResponsePayload, ResponsePayloadResponse } from '../../users/dto/response-payload.dto';
import { Attachment } from '../attachment.entity';

export class AttachmentPayload extends ResponsePayloadResponse {
  attachment: Attachment;
  response?: ResponsePayload
}

export class AttachmentMediaPayload extends ResponsePayloadResponse {
  preSignedUrl: string;
  response?: ResponsePayload
}
