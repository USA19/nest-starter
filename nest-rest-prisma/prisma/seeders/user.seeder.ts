import { InternalServerErrorException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { createPasswordHash } from '../../src/lib/helper';
import { UsersData } from '../../src/users/seeds/seed-data';

export const UserSeeder = async (prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
  try {
    const allRoles = await prisma.role.findMany()

    if (allRoles.length)
      await Promise.all(
        UsersData.map(async (user) => {
          const { email, password } = user
          const isExistingUser = await prisma.user.findUnique({ where: { email } })

          if (!isExistingUser) {
            const role = allRoles.find(object => (object.role === user.roleType));

            user.password = await createPasswordHash(password)
            delete user.roleType;
            await prisma.user.create({
              data: {
                ...user,
                userRole: {
                  create: {
                    roleId: role.id,
                  }
                }
              },
            });

          }
        })
      )

    console.log(">>>>>>>>>>>>>>>>USERS CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
  } catch (error) {
    throw new InternalServerErrorException(error)
  }
}
