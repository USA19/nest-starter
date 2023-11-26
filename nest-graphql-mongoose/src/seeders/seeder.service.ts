import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { UsersService } from '../users/users.service';


@Injectable()
export class Seeder {
  constructor(private readonly userService: UsersService) { }

  @Command({
    command: 'seed:all',
    describe: 'Seeding Data'
  })
  async insert(): Promise<void> {
    try {

      await this.userService.seedRoles()
      await this.userService.seedUsers()

      console.log(">>>>>>>>>>>>>>>>DATA CREATED SUCCESSFULLY>>>>>>>>>>>>>>>>>>")
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

}