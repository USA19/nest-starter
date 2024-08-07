import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "@prisma/client";
import { RoleDto } from "./role.dto";

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  emailVerified: boolean | null;

  @ApiProperty()
  password: string | null;

  @ApiProperty()
  phoneNumber: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ type: () => [UserOnRoleDto] })
  userRole: UserOnRoleDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserOnRoleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty({ type: () => RoleDto })
  role?: RoleDto;

  @ApiProperty({ type: () => UserDto })
  user?: UserDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
