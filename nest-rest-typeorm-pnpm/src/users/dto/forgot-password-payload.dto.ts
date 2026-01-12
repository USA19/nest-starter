import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResponsePayload } from './response-payload.dto';

export class ForgotPasswordPayload {
  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload;
}
