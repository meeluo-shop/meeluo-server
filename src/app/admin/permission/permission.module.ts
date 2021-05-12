import { Module } from '@nestjs/common';
import { AdminPermissionController } from './permission.controller';
import { AdminPermissionService } from './permission.service';
import { AdminPermissionLifecycle } from './permission.lifecycle';

const providers = [AdminPermissionService, AdminPermissionLifecycle];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AdminPermissionController],
})
export class AdminPermissionModule {}
