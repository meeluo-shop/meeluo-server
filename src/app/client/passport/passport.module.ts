import { Module, Global } from '@nestjs/common';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantWechatModule } from '@app/merchant/wechat';
import { ClientWechatModule } from '../wechat';
import { ClientMerchantModule } from '../merchant';
import { ClientPassportController } from './passport.controller';
import { ClientPassportService } from './passport.service';

const providers = [ClientPassportService];

@Global()
@Module({
  imports: [
    ClientWechatModule,
    MerchantWechatModule,
    MerchantUserModule,
    ClientMerchantModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientPassportController],
})
export class ClientPassportModule {}
