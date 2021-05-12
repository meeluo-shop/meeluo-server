import { Module } from '@nestjs/common';
import { MerchantRoleController } from './role.controller';
import { MerchantRoleService } from './role.service';

const providers = [MerchantRoleService];

/**
 * 商户后台暂时不做角色权限控制，所以该模块并没有使用
 */
@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantRoleController],
})
export class MerchantStaffRoleModule {}
