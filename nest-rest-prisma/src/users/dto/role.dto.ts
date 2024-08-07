import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client"

export class RoleDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}