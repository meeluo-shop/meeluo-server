import { Module } from '@nestjs/common';
import { AdminRoleModule } from '../role';
import { AdminUserController } from './user.controller';
import { AdminUserService } from './user.service';

const providers = [AdminUserService];

@Module({
  imports: [AdminRoleModule],
  providers,
  exports: providers,
  controllers: [AdminUserController],
})
export class AdminUserModule {}
