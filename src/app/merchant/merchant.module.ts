import { AuthModule } from '@core/decorator';
import { RegionModule } from '@app/common/region';
import { WechatQRCodeModule } from '@app/common/wechat/qrcode';
import { MERCHANT_TOKEN_HEADER } from '@core/constant';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { MerchantPassportModule } from './passport';
import { MerchantSettingModule } from './setting';
import { MerchantRechargeModule } from './recharge';
import { MerchantGoodsModule } from './goods';
import { MerchantUserModule } from './user';
import { MerchantPointsModule } from './points';
import { MerchantDeliveryModule } from './delivery';
import { MerchantAddressModule } from './address';
import { MerchantCouponModule } from './coupon';
import { MerchantGameModule } from './game';
import { MerchantStaffModule } from './staff';
import { MerchantWechatModule } from './wechat';
import { MerchantPageModule } from './page';
import { MerchantWinningModule } from './winning';
import { MerchantOrderModule } from './order';
import { MerchantAttendantModule } from './attendant';
import { MerchantTableModule } from './table';
import { MerchantMenuModule } from './menu';
import { MerchantStatisticsModule } from './statistics';
import { MerchantDeviceModule } from './device';

const providers = [MerchantService];
const modules = [
  MerchantAddressModule,
  MerchantPointsModule,
  MerchantUserModule,
  MerchantGoodsModule,
  MerchantRechargeModule,
  MerchantSettingModule,
  MerchantPassportModule,
  MerchantDeliveryModule,
  MerchantCouponModule,
  MerchantGameModule,
  MerchantStaffModule,
  MerchantWechatModule,
  MerchantPageModule,
  MerchantWinningModule,
  MerchantOrderModule,
  MerchantAttendantModule,
  MerchantTableModule,
  MerchantMenuModule,
  MerchantStatisticsModule,
  MerchantDeviceModule,
];

@AuthModule({
  header: MERCHANT_TOKEN_HEADER,
  imports: [RegionModule, WechatQRCodeModule, ...modules],
  providers,
  exports: [...modules, ...providers],
  controllers: [MerchantController],
})
export class MerchantModule {}
