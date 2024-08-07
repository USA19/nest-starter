import { ResponsePayload } from './response-payload.dto';
import PaginationPayload from './pagination-payload.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserDto } from './user.dto';

export class UsersPayload {
  @ApiProperty({ type: [UserDto] })
  users: User[];

  @ApiPropertyOptional({ type: PaginationPayload })
  pagination?: PaginationPayload

  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload
}
