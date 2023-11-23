import { ResponsePayload } from './response-payload.dto';
import { Role } from '../entities/role.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AccessUserPayload {
  @ApiPropertyOptional()
  access_token?: string;

  @ApiProperty({ type: [Role] })
  roles: Role[];

  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload;
}
