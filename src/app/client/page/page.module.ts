import { Module } from '@nestjs/common';
import { MerchantPageModule } from '@app/merchant/page';
import { MerchantPageSettingModule } from '@app/merchant/page/setting';
import { ClientPageController } from './page.controller';
import { ClientPageService } from './page.service';

const providers = [ClientPageService];

@Module({
  imports: [MerchantPageModule, MerchantPageSettingModule],
  providers,
  exports: providers,
  controllers: [ClientPageController],
})
export class ClientPageModule {}
