import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { CommonService } from '../common.service';

const providers = [CommonService, ResourceService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [ResourceController],
})
export class ResourceModule {}
