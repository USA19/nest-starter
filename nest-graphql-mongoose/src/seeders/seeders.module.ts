import { Module } from '@nestjs/common';
import { Seeder } from './seeder.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [],
    providers: [Seeder],
    exports: [Seeder]
})
export class SeedersModule { }
