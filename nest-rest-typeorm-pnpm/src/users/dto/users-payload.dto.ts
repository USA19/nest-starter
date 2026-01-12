import { User } from '../entities/user.entity';
import { ResponsePayload } from './response-payload.dto';
import PaginationPayload from './pagination-payload.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UsersPayload {
  @ApiProperty({ type: [User] })
  users: User[];

  @ApiPropertyOptional({ type: PaginationPayload })
  pagination?: PaginationPayload

  @ApiPropertyOptional({ type: ResponsePayload })
  response?: ResponsePayload
}
