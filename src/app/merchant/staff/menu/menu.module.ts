import { Module } from '@nestjs/common';
import { MerchantStaffMenuController } from './menu.controller';
import { MerchantStaffMenuService } from './menu.service';

const providers = [MerchantStaffMenuService];

/**
 * 商户后台暂时不做角色权限控制，所以该模块并没有使用
 */
@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantStaffMenuController],
})
export class MerchantStaffMenuModule {}
