import { Module } from '@nestjs/common';
import { MerchantUserGradeController } from './grade.controller';
import { MerchantUserGradeService } from './grade.service';

const providers = [MerchantUserGradeService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [MerchantUserGradeController],
})
export class MerchantUserGradeModule {}
