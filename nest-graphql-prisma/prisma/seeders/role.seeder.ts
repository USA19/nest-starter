import { InternalServerErrorException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { RolesData } from '../../src/users/seeds/seed-data';

export const RoleSeeder = async (prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
  try {
    const roles = await prisma.role.findMany()
    const dbRoles = roles.map(role => role.role)

    await Promise.all(
      RolesData.map(async ({ role }) => {
        if (!dbRoles.includes(role)) {
          return prisma.role.create({ data: { role } });
        }
      })
    )

    console.log(">>>>>>>>>>>>>>>>USER ROLES CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
  } catch (error) {
    throw new InternalServerErrorException(error)
  }
}
