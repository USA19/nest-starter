import { User } from '../entities/user.entity';
import { ResponsePayload } from './response-payload.dto';

export class UserPayload {
  user: User;
  response?: ResponsePayload;
}
