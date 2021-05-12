import { Module } from '@nestjs/common';
import { MerchantUserGradeModule } from '@app/merchant/user/grade';
import { ClientUserGradeController } from './grade.controller';
import { ClientUserGradeService } from './grade.service';

const providers = [ClientUserGradeService];

@Module({
  imports: [MerchantUserGradeModule],
  providers,
  exports: providers,
  controllers: [ClientUserGradeController],
})
export class ClientUserGradeModule {}
