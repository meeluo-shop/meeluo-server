import { Module } from '@nestjs/common';
import { CodeService } from './code.service';

const providers = [CodeService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [],
})
export class CodeModule {}
