import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/role.entity';
import { UserStatus } from '../entities/user.entity';
import PaginationInput from './pagination-input.dto';

export default class UsersInput {
  @ApiPropertyOptional()
  from?: string;

  @ApiPropertyOptional()
  to?: string;

  @ApiPropertyOptional()
  status?: UserStatus;

  @ApiPropertyOptional()
  roles?: UserRole[];

  @ApiPropertyOptional()
  searchQuery?: string;

  @ApiProperty({ type: PaginationInput })
  paginationOptions: PaginationInput;
}
