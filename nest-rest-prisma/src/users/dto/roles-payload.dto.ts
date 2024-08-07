import { Role } from '@prisma/client';
import { ResponsePayload } from './response-payload.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleDto } from './role.dto';

export default class RolesPayload {
  @ApiProperty({ type: [RoleDto] })
  roles: Role[];

  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload;
}
