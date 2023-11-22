import { ResponsePayloadResponse } from '../../users/dto/response-payload.dto';

export class GetAttachmentPayload extends ResponsePayloadResponse {
  preSignedUrl?: string;
}