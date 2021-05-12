import { Module } from '@nestjs/common';
import { MerchantUserService } from '../user/user.service';
import { MerchantUserGradeModule } from '../user/grade';
import { MerchantPointsSettingModule } from './setting';
import { MerchantPointsController } from './points.controller';
import { MerchantPointsService } from './points.service';

const providers = [MerchantUserService, MerchantPointsService];
const modules = [MerchantUserGradeModule, MerchantPointsSettingModule];

@Module({
  imports: modules,
  providers,
  exports: [...providers, ...modules],
  controllers: [MerchantPointsController],
})
export class MerchantPointsModule {}
