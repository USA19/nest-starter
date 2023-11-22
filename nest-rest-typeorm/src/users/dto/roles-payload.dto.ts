import { ResponsePayload } from './response-payload.dto';
import { Role } from '../entities/role.entity';

export default class RolesPayload {
  roles: Role[];
  response?: ResponsePayload;
}
