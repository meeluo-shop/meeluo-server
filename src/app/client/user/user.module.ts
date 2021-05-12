import { Module } from '@nestjs/common';
import { MerchantUserModule } from '@app/merchant/user';
import { MerchantTableModule } from '@app/merchant/table';
import { SMSModule } from '@app/common/sms';
import { CodeModule } from '@app/common/code';
import { ClientWechatModule } from '../wechat';
import { ClientUserController } from './user.controller';
import { ClientUserService } from './user.service';
import { ClientUserGradeModule } from './grade';

const providers = [ClientUserService, ClientUserGradeModule];

@Module({
  imports: [
    SMSModule,
    CodeModule,
    MerchantUserModule,
    MerchantTableModule,
    ClientWechatModule,
    ClientUserGradeModule,
  ],
  providers,
  exports: providers,
  controllers: [ClientUserController],
})
export class ClientUserModule {}
