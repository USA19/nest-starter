import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ResponsePayload {
  @ApiProperty()
  status: number;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  name?: string;
}

export class ResponsePayloadResponse {
  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload;
}
