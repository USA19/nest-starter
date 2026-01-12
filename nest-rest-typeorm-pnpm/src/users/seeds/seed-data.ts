import { UserRole } from '../../users/entities/role.entity';
import { UserStatus } from '../entities/user.entity';

export const RolesData = [
  { role: UserRole.SUPER_ADMIN },
  { role: UserRole.ADMIN },
  { role: UserRole.USER },
];

export const UsersData = [
  { firstName: "Usama", lastName: "Sarfraz", password: "Super123!", email: "muhamedusama468@gmail.com", status: UserStatus.ACTIVE, roleType: UserRole.SUPER_ADMIN, emailVerified: true },
  { firstName: "muhammad", lastName: "kashif", password: "Super123!", email: "muhammad.kashif@mavrictech.com", status: UserStatus.ACTIVE, roleType: UserRole.ADMIN, emailVerified: true },
];
