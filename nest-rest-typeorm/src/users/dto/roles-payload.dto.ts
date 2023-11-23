import { ResponsePayload } from './response-payload.dto';
import { Role } from '../entities/role.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class RolesPayload {
  @ApiProperty({ type: [Role] })
  roles: Role[];

  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload;
}
