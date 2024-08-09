import { InputType, Field, PickType } from '@nestjs/graphql';
import { UpdateUserInput } from './update-user-input.dto';
import { UserRole } from '@prisma/client';

@InputType()
export class UpdateRoleInput extends PickType(UpdateUserInput, ['id'] as const) {
  @Field(() => [UserRole])
  roles: UserRole[];
}
