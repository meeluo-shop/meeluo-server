import { Module } from '@nestjs/common';
import { ResourceModule } from '@app/common/resource';
import { MerchantGoodsCategoryController } from './category.controller';
import { MerchantGoodsCategoryService } from './category.service';

const providers = [MerchantGoodsCategoryService];

@Module({
  imports: [ResourceModule],
  providers,
  exports: providers,
  controllers: [MerchantGoodsCategoryController],
})
export class MerchantGoodsCategoryModule {}
