import { ResponsePayload } from './response-payload.dto';
import { Role } from '../entities/role.entity';

export class AccessUserPayload {
  access_token?: string;
  roles: Role[];
  response?: ResponsePayload;
}
