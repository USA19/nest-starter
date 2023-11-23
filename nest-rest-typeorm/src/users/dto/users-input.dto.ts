import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/role.entity';
import { UserStatus } from '../entities/user.entity';

export default class UsersInput {
  @ApiPropertyOptional()
  from?: string;

  @ApiPropertyOptional()
  to?: string;

  @ApiPropertyOptional()
  status?: UserStatus;

  @ApiPropertyOptional({ enum: UserRole, isArray: true })
  roles?: UserRole[];

  @ApiPropertyOptional()
  searchQuery?: string;

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number
}
