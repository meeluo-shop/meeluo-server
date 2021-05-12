import { Module } from '@nestjs/common';
import { ClientWechatModule } from '../wechat';
import { ClientRechargeController } from './recharge.controller';
import { ClientRechargeService } from './recharge.service';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { MerchantRechargePlanModule } from '@app/merchant/recharge/plan';
import { MerchantRechargeSettingModule } from '@app/merchant/recharge/setting';

const providers = [ClientRechargeService];

@Module({
  imports: [
    ClientWechatModule,
    MerchantWechatModule,
    MerchantUserModule,
    MerchantRechargePlanModule,
    MerchantRechargeSettingModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientRechargeController],
})
export class ClientRechargeModule {}
