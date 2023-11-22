import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
  UpdateEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
// import { MailerService } from '../../mailer/mailer.service';
// import { UsersService } from '../users.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    private readonly connection: DataSource,
    // private readonly mailerService: MailerService,
    // private readonly usersService: UsersService,
  ) {
    this.connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    event.entity.password = await bcrypt.hash(
      event.entity.password,
      await bcrypt.genSalt(),
    );
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const emailGotUpdated = event.updatedColumns.find(
      (value) => value.propertyName,
      User.prototype.email,
    );

    if (emailGotUpdated) {
      if (event.databaseEntity.email !== event.entity.email) {
        const user = event.entity;
        Logger.log(
          `Email changed from 
        ${event.databaseEntity.email} to 
				${event.entity.email}`,
          'Email Got Updated',
        );
        event.entity.emailVerified = false;

        // TODO: Adjust your mailer logic accordingly.
        // this.mailerService.sendVerificationEmail(
        //   user.email,
        //   user.fullName,
        //   user.id,
        // );
      }
    }
  }
}
