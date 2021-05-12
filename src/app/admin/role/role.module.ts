import { Module } from '@nestjs/common';
import { AdminRoleController } from './role.controller';
import { AdminRoleService } from './role.service';

const providers = [AdminRoleService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AdminRoleController],
})
export class AdminRoleModule {}
