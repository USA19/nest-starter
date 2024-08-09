import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UserStatus } from "@prisma/client";
import { RoleDto } from "./role.dto";

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'The user status',
});

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string | null;

  @Field({ nullable: true })
  lastName: string | null;

  @Field({ nullable: true })
  emailVerified: boolean | null;

  @Field({ nullable: true })
  password: string | null;

  @Field({ nullable: true })
  phoneNumber: string | null;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => [UserOnRoleDto])
  userRole: UserOnRoleDto[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserOnRoleDto {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  roleId: string;

  @Field(() => RoleDto, { nullable: true })
  role?: RoleDto;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
