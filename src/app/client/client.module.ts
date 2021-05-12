import { AuthModule } from '@core/decorator';
import { CLIENT_TOKEN_HEADER } from '@core/constant';
import { ClientWechatModule } from './wechat';
import { ClientPassportModule } from './passport';
import { ClientGameModule } from './game';
import { ClientMerchantModule } from './merchant';
import { ClientPageModule } from './page';
import { ClientGoodsModule } from './goods';
import { ClientUserModule } from './user';
import { ClientPointsModule } from './points';
import { ClientCartModule } from './cart';
import { ClientWinningModule } from './winning';
import { ClientAddressModule } from './address';
import { ClientOrderModule } from './order';
import { ClientRechargeModule } from './recharge';
import { ClientAttendantModule } from './attendant';
import { ClientExpressModule } from './express';
import { ClientMenuModule } from './menu';
import { ClientCouponModule } from './coupon';

const modules = [
  ClientPassportModule,
  ClientWechatModule,
  ClientGameModule,
  ClientMerchantModule,
  ClientPageModule,
  ClientGoodsModule,
  ClientUserModule,
  ClientPointsModule,
  ClientCartModule,
  ClientWinningModule,
  ClientAddressModule,
  ClientOrderModule,
  ClientRechargeModule,
  ClientAttendantModule,
  ClientExpressModule,
  ClientMenuModule,
  ClientCouponModule,
];

@AuthModule({
  header: CLIENT_TOKEN_HEADER,
  imports: modules,
  providers: [],
  exports: modules,
  controllers: [],
})
export class ClientModule {}
