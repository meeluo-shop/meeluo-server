import { Module } from '@nestjs/common';
import { MerchantPageSettingModule } from './setting';
import { MerchantPageController } from './page.controller';
import { MerchantPageService } from './page.service';

const providers = [MerchantPageService];
const modules = [MerchantPageSettingModule];

@Module({
  imports: modules,
  providers,
  exports: [...providers, ...modules],
  controllers: [MerchantPageController],
})
export class MerchantPageModule {}
