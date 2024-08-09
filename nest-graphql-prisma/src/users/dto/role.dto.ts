import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { UserRole } from "@prisma/client"

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The user status',
});

@ObjectType()
export class RoleDto {
  @Field()
  id: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}