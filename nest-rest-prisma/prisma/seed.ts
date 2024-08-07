import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeders/user.seeder';
import { RoleSeeder } from './seeders/role.seeder';
const prisma = new PrismaClient();

const main = async () => {
  await Promise.all([
    RoleSeeder(prisma),
    UserSeeder(prisma)
  ])
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
