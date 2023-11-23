import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { ResponsePayload } from './response-payload.dto';

export class UserPayload {
  @ApiProperty({ type: User })
  user: User;

  @ApiProperty({ type: ResponsePayload })
  response?: ResponsePayload;
}
