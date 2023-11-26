import { InputType, Field, PickType } from '@nestjs/graphql';
import { UserRole } from '../entities/role.entity';
import { UpdateUserInput } from './update-user-input.dto';

@InputType()
export class UpdateRoleInput extends PickType(UpdateUserInput, ['id'] as const) {
  @Field(() => [UserRole])
  roles: UserRole[];
}
