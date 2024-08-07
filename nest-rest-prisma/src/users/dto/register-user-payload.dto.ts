import { ApiProperty } from '@nestjs/swagger';
import { ResponsePayload } from './response-payload.dto';
import { User } from "@prisma/client";
import { UserDto } from './user.dto';

export class UserPayload {
  @ApiProperty({ type: UserDto })
  user: User;

  @ApiProperty({ type: ResponsePayload })
  response?: ResponsePayload;
}
