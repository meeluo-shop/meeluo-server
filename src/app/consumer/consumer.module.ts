import { Module } from '@nestjs/common';
import { OrderConsumerModule } from './order';

const modules = [OrderConsumerModule];

@Module({
  imports: modules,
  providers: [],
  exports: modules,
  controllers: [],
})
export class ConsumerModule {}
