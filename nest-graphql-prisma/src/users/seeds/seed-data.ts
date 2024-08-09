import { UserRole, UserStatus } from "@prisma/client";

export const RolesData = [
  { role: UserRole.SUPER_ADMIN },
  { role: UserRole.ADMIN },
  { role: UserRole.USER },
];

export const UsersData = [
  { firstName: "Usama", lastName: "Sarfraz", password: "Super123!", email: "muhamedusama468@gmail.com", status: UserStatus.ACTIVE, roleType: UserRole.SUPER_ADMIN, emailVerified: true },
];
