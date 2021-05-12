import { Module } from '@nestjs/common';
import { QiniuController } from './qiniu.controller';

const providers = [];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [QiniuController],
})
export class QiniuModule {}
