import { Module } from '@nestjs/common';
import { SMSService } from './sms.service';
import { CodeModule } from '../code';

const providers = [SMSService];

@Module({
  imports: [CodeModule],
  providers,
  exports: providers,
  controllers: [],
})
export class SMSModule {}
