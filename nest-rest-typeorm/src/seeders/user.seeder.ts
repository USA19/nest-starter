import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersData } from '../users/seeds/seed-data';
import { createPasswordHash } from '../lib/helper';
import { Role } from '../users/entities/role.entity';
import { InternalServerErrorException } from '@nestjs/common';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    try {
      const allRoles = await dataSource.getRepository(Role).find();
      const usersRepository = dataSource.getRepository(User);

      // add USERS from users data in users/seeds/seed-data.ts
      await Promise.all(
        UsersData.map(async (user) => {
          const isExistingUser = await usersRepository.findOne({ where: { email: user.email } })

          if (!isExistingUser) {
            user.password = await createPasswordHash(user.password)

            const userObject = usersRepository.create(user);
            const role = allRoles.filter(object => (object.role === user.roleType));
            userObject.roles = role;

            const createdUser = usersRepository.create(userObject)
            await usersRepository.save(createdUser)
          }
        })
      )

      console.log(">>>>>>>>>>>>>>>>USERS CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}