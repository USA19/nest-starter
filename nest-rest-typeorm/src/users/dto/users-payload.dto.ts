import { User } from '../entities/user.entity';
import { ResponsePayload } from './response-payload.dto';
import PaginationPayload from './pagination-payload.dto';

export class UsersPayload {
  users: User[];
  pagination?: PaginationPayload
  response?: ResponsePayload
}
