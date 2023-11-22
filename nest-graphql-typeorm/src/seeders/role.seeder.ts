import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { RolesData } from '../users/seeds/seed-data';
import { Role } from '../users/entities/role.entity';
import { InternalServerErrorException } from '@nestjs/common';

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    try {
      const rolesRepository = dataSource.getRepository(Role);
      const roles = await rolesRepository.find();
      const dbRoles = roles.map(role => role.role)

      await Promise.all(
        RolesData.map(async ({ role }) => {
          if (!dbRoles.includes(role)) {
            const newRoles = rolesRepository.create({ role });
            await rolesRepository.save(newRoles);
          }
        })
      )

      console.log(">>>>>>>>>>>>>>>>USER ROLES CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}