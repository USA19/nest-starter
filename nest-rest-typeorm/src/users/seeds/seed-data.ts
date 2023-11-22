import { UserRole } from '../../users/entities/role.entity';
import { UserStatus } from '../entities/user.entity';

export const RolesData = [
  { role: UserRole.SUPER_ADMIN },
  { role: UserRole.ADMIN },
];

export const UsersData = [
  { firstName: "Usama", lastName: "Sarfraz", password: "Super123!", email: "muhamedusama468@gmail.com", status: UserStatus.ACTIVE, roleType: UserRole.SUPER_ADMIN, emailVerified: true },
];
