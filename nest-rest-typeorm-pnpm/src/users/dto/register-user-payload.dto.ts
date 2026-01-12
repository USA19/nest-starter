import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { ResponsePayload } from './response-payload.dto';

export class UserPayload {
  @ApiProperty({ type: User, nullable: true })
  user: User | null;

  @ApiProperty({ type: ResponsePayload })
  response?: ResponsePayload;
}
