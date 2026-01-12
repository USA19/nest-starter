import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResponsePayloadResponse } from '../../users/dto/response-payload.dto';

export class GetAttachmentPayload extends ResponsePayloadResponse {
  @ApiPropertyOptional()
  preSignedUrl?: string;
}