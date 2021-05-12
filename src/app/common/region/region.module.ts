import { Module } from '@nestjs/common';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

const providers = [RegionService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [RegionController],
})
export class RegionModule {}
