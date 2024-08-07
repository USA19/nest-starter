import { ResponsePayload } from "./response-payload.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RoleDto } from "./role.dto";
import { Role } from "@prisma/client";

export class AccessUserPayload {
  @ApiPropertyOptional()
  access_token?: string;

  @ApiPropertyOptional()
  refresh_token?: string;

  @ApiProperty({ type: [RoleDto] })
  roles: Role[];

  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload;
}
