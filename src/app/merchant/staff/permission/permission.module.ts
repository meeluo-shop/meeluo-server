import { Module } from '@nestjs/common';
import { MerchantStaffPermissionController } from './permission.controller';
import { MerchantStaffPermissionService } from './permission.service';
import { MerchantStaffPermissionLifecycle } from './permission.lifecycle';

const providers = [
  MerchantStaffPermissionService,
  MerchantStaffPermissionLifecycle,
];

/**
 * 商户后台暂时不做角色权限控制，所以该模块并没有使用
 */
@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantStaffPermissionController],
})
export class MerchantStaffPermissionModule {}
